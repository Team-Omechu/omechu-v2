export const handleLocation = async (
  setX: (x: number) => void,
  setY: (y: number) => void,
  setLocationDenied: (v: boolean) => void,
) => {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      setLocationDenied(false);
      setX(latitude);
      setY(longitude);
    },
    (error) => {
      // 1: PERMISSION_DENIED
      if (error.code === 1) setLocationDenied(true);
      console.error("위치 정보를 가져오는 중 오류 발생", error);
    },
  );
};
