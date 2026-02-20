import sisbLogo from "@/assets/kings-college-logo.jpg";

interface LogoBadgeProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: "h-16",
  md: "h-20",
  lg: "h-32",
};

export const LogoBadge = ({ size = "md", className = "" }: LogoBadgeProps) => {
  return (
    <div className={`rounded-xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.4)] ring-1 ring-white/20 backdrop-blur-sm bg-white/10 p-1 ${className}`}>
      <img
        src={sisbLogo}
        alt="SISB International Schools"
        className={`${sizeMap[size]} w-auto drop-shadow-md`}
      />
    </div>
  );
};
