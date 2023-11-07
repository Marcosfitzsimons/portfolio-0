const Blob = () => {
  return (
    <div className="-z-10 absolute h-80 w-full top-20 max-w-lg sm:top-44">
      <div className="absolute top-0 -left-4 w-72 aspect-square bg-purple-300 rounded-full mix-blend-multiply filter blur-2xl animate-blob opacity-30"></div>
      <div className="absolute top-0 -right-4 w-72 aspect-square bg-pink-300 rounded-full mix-blend-multiply filter blur-2xl animate-blob animation-delay-2000 opacity-30"></div>
      <div className="absolute -bottom-8 left-20 w-72 aspect-square bg-orange-300 rounded-full mix-blend-multiply filter blur-2xl animate-blob animation-delay-4000 opacity-30"></div>
    </div>
  );
};

export default Blob;
