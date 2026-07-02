import BrandLogo from '@/components/common/BrandLogo';

const HomeFooter = () => {
  return (
    <footer className="bg-primary text-primary-foreground py-10 px-4">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <BrandLogo size={36} className="rounded-[10px] ring-1 ring-primary-foreground/20" />
            <span className="text-lg font-extrabold tracking-tight">
              Estuda <span className="text-accent">Flash</span>
            </span>
          </div>
          <div className="text-center md:text-right">
            <p className="text-sm font-medium">
              &copy; {new Date().getFullYear()} Estuda Flash. Feito com 💚 no Brasil.
            </p>
            <p className="mt-1 text-xs text-primary-foreground/70">
              Transformando educação com inteligência artificial.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default HomeFooter;
