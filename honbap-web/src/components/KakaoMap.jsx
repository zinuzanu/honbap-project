import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";

const KakaoMap = forwardRef(({ restaurants, onSelect, onMapLoad }, ref) => {
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const selectedMarkerRef = useRef(null);

  useImperativeHandle(ref, () => ({
    highlightMarkerByRestaurant(restaurant) {
      const target = markersRef.current.find(
        ({ data }) => data.kakaoPlaceId === restaurant.kakaoPlaceId
      );
      if (target) {
        if (selectedMarkerRef.current) {
          selectedMarkerRef.current.marker.setImage(defaultMarkerImage());
        }
        target.marker.setImage(selectedMarkerImage());
        selectedMarkerRef.current = target;

        if (mapRef.current) {
          mapRef.current.setLevel(2);
          mapRef.current.setCenter(target.position);
        }
      }
    },

    clearHighlightedMarker() {
    if (selectedMarkerRef.current) {
      selectedMarkerRef.current.marker.setImage(defaultMarkerImage());
      selectedMarkerRef.current = null;
    }
  }
}));

  function defaultMarkerImage() {
    const kakao = window.kakao;
    return new kakao.maps.MarkerImage(
      "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png",
      new kakao.maps.Size(16, 24),
      { offset: new kakao.maps.Point(8, 24) }
    );
  }

  function selectedMarkerImage() {
    const kakao = window.kakao;
    return new kakao.maps.MarkerImage(
      "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png",
      new kakao.maps.Size(24, 35)
    );
  }

  useEffect(() => {
    if (window.kakao && window.kakao.maps) {
      initializeMap();
    } else {
      const script = document.createElement("script");
      script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${import.meta.env.VITE_KAKAO_MAP_API_KEY}&autoload=false&libraries=services`;
      script.async = true;
      document.head.appendChild(script);

      script.onload = () => {
        window.kakao.maps.load(() => {
          initializeMap();
        });
      };
    }

    function initializeMap() {
      const kakao = window.kakao;
      const container = document.getElementById("map");
      if (!container) return;

      const mapOption = {
        center: new kakao.maps.LatLng(37.448830, 126.657790),
        level: 4,
      };

      const map = new kakao.maps.Map(container, mapOption);
      mapRef.current = map;
      if (onMapLoad) onMapLoad(map);

      addMarkers(map);
    }
  }, []);

  useEffect(() => {
    if (mapRef.current) {
      addMarkers(mapRef.current);
    }
  }, [restaurants]);

  function addMarkers(map) {
    clearMarkers();

    const kakao = window.kakao;
    markersRef.current = restaurants.map((r) => {
      const position = new kakao.maps.LatLng(r.lat, r.lng);
      const marker = new kakao.maps.Marker({
        position,
        image: defaultMarkerImage(),
      });

      kakao.maps.event.addListener(marker, "click", () => {
        if (onSelect) onSelect(r, map);

        if (selectedMarkerRef.current) {
          selectedMarkerRef.current.marker.setImage(defaultMarkerImage());
        }
        marker.setImage(selectedMarkerImage());
        selectedMarkerRef.current = { marker, position, data: r };

        map.setLevel(2);
        map.setCenter(position);
      });

      marker.setMap(map);
      return { marker, position, data: r }; // 🔥 data를 같이 저장
    });

    kakao.maps.event.addListener(map, "bounds_changed", () => {
      updateVisibleMarkers(map);
    });
  }

  function clearMarkers() {
    markersRef.current.forEach(({ marker }) => marker.setMap(null));
    markersRef.current = [];
  }

  function updateVisibleMarkers(map) {
    const bounds = map.getBounds();
    markersRef.current.forEach(({ marker, position }) => {
      if (bounds.contain(position)) {
        marker.setMap(map);
      } else {``
        marker.setMap(null);
      }
    });
  }

  return <div id="map" style={{ width: "100%", height: "100vh" }} />;
});

export default KakaoMap;