import { BackgroundGradientAnimation } from "@/components/ui/background-gradient-animation";

const Index = () => {
  return (
    <BackgroundGradientAnimation>
      <div className="absolute z-50 inset-0 flex items-center justify-center">
        <p className="bg-clip-text text-transparent drop-shadow-2xl bg-gradient-to-b from-neutral-50 to-neutral-400 text-center text-3xl font-bold md:text-5xl lg:text-7xl">
          hello
        </p>
      </div>
    </BackgroundGradientAnimation>
  );
};

export default Index;
