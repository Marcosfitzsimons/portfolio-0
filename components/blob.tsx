const Blob = () => {
  return (
    <div className="-z-10 fixed h-44 w-full top-20 max-w-lg lg:top-44 sm:h-80">
      <div className="absolute top-0 -left-4 w-44 aspect-square bg-purple-300 rounded-full mix-blend-multiply filter blur-2xl animate-blob opacity-30 sm:w-72"></div>
      <div className="absolute top-0 -right-4 w-44 aspect-square bg-pink-300 rounded-full mix-blend-multiply filter blur-2xl animate-blob animation-delay-2000 opacity-30 sm:w-72"></div>
      <div className="absolute -bottom-4 left-20 w-44 aspect-square bg-orange-300 rounded-full mix-blend-multiply filter blur-2xl animate-blob animation-delay-4000 opacity-30 sm:w-72"></div>
    </div>
  );
};

export default Blob;
