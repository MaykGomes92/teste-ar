
interface LogoWithoutBackgroundProps {
  className?: string;
  alt?: string;
  style?: React.CSSProperties;
}

const LogoWithoutBackground = ({ className, alt = "Orla Consultoria", style }: LogoWithoutBackgroundProps) => {
  return (
    <img 
      src="/lovable-uploads/8a502a11-5962-4054-a303-402c241cc14e.png" 
      alt={alt}
      className={className}
      style={style}
    />
  );
};

export default LogoWithoutBackground;
