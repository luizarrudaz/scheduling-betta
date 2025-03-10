interface IndicatorDotProps {
    show: boolean;
  }
  
  export default function IndicatorDot({ show }: IndicatorDotProps) {
    return (
      <div className="w-1 h-1 mx-auto mt-1">
        {show && <div className="w-1 h-1 rounded-full bg-sky-500" />}
      </div>
    );
  }