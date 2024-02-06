const Blob = () => {
  return (
    <div className="fixed top-20 -z-10 h-44 w-full max-w-lg sm:h-80 lg:top-44">
      <div className="absolute -left-4 top-0 aspect-square w-44 animate-blob rounded-full bg-purple-300 opacity-30 mix-blend-multiply blur-2xl filter sm:w-72"></div>
      <div className="animation-delay-2000 absolute -right-4 top-0 aspect-square w-44 animate-blob rounded-full bg-pink-300 opacity-30 mix-blend-multiply blur-2xl filter sm:w-72"></div>
      <div className="animation-delay-4000 absolute -bottom-4 left-20 aspect-square w-44 animate-blob rounded-full bg-orange-300 opacity-30 mix-blend-multiply blur-2xl filter sm:w-72"></div>
    </div>
  );
};

export default Blob;
