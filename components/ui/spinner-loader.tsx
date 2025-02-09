import HashLoader from 'react-spinners/HashLoader';

interface SpinnerLoaderProps {
  isHome?: boolean;
}

export function SpinnerLoader({ isHome = false }: SpinnerLoaderProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center h-screen ${
        isHome ? 'bg-opacity-70 backdrop-blur-md relative' : ''
      }`}
      style={
        isHome
          ? {
              backgroundImage: 'url("/sidebar_background_2.jpg")',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }
          : {}
      }
    >
      {isHome ? <div className="absolute inset-0 bg-black/40 z-10" /> : null}
      <HashLoader color={isHome ? '#fff' : '#000'} size={isHome ? 80 : 50} />
    </div>
  );
}
