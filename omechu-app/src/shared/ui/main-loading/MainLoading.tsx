export function MainLoading() {
  return (
    <>
      <style>
        {`
          @keyframes cycle {
            0% { background-position: 0 0; }
            100% { background-position: -525px 0; }
          }
          .animate-food-cycle {
            animation: cycle 0.5s steps(3) infinite;
          }
        `}
      </style>

      <div
        className="fixed inset-0 z-[10000] bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/image/loading-bg.png')" }}
      >
        <div
          className="animate-food-cycle absolute top-1/2 left-1/2 h-[170px] w-[175px] -translate-x-1/2 -translate-y-1/2 bg-[url('/image/food-sprite.svg')]"
          style={{ backgroundSize: "525px 170px" }}
        />
      </div>
    </>
  );
}
