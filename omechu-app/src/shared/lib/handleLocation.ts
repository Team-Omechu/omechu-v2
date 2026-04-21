export const handleLocation = (
  setX: (x: number) => void,
  setY: (y: number) => void,
  setLocationDenied: (v: boolean) => void,
): Promise<void> =>
  new Promise((resolve) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      resolve();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocationDenied(false);
        setX(latitude);
        setY(longitude);
        resolve();
      },
      (error) => {
        // error.code: 1=PERMISSION_DENIED, 2=POSITION_UNAVAILABLE, 3=TIMEOUT
        if (error.code === 1) {
          setLocationDenied(true);
        }
        console.warn("[handleLocation] geolocation error code", error.code);
        resolve();
      },
    );
  });
