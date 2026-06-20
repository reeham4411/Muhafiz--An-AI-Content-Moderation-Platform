export function AmbientBlobs() {
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="blob h-[28rem] w-[28rem] bg-teal-300 top-[-6rem] left-[-8rem] animate-blob-float" />
      <div className="blob h-[24rem] w-[24rem] bg-amber-300 top-[10rem] right-[-6rem] animate-blob-float-slow" />
      <div className="blob h-[20rem] w-[20rem] bg-coral-300 bottom-[-4rem] left-[20%] animate-blob-float" />
    </div>
  );
}
