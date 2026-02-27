import sisbLogo from "@/assets/kings-college-logo.png";

interface LogoBadgeProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  imgClassName?: string;
}

export const LogoBadge = ({ className = "", imgClassName = "" }: LogoBadgeProps) => {
  return (
    <div className={className}>
      <img
        src={sisbLogo}
        alt="SISB International Schools"
        className={imgClassName}
      />
    </div>
  );
};
