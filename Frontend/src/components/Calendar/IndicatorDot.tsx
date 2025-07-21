interface IndicatorDotProps {
    show: boolean;
  }

  export default function IndicatorDot({ show }: IndicatorDotProps) {
    return (
      <div className="w-1 h-1 flex items-center justify-center transition-opacity duration-200">
        {show && <div className="w-1.5 h-1.5 rounded-full bg-secondary dark:bg-secondary-light" />}
      </div>
    );
  }