import { useEffect, useState } from "react";
import KakaoMap from "../components/KakaoMap";
import axios from "axios";

const Home = () => {
  const [restaurants, setRestaurants] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:8080/api/map/search", {
        params: { keyword: "맛집", region: "인천" },
      })
      .then((res) => setRestaurants(res.data))
      .catch((err) => console.error("음식점 로딩 실패:", err));
  }, []);

  return <KakaoMap restaurants={restaurants} />;
};

export default Home;
