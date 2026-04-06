import React from "react";

interface IconProps {
  size?: number;
  className?: string;
}

const iconProps = (size = 20) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
});

export const HomeIcon: React.FC<IconProps> = ({ size, className }) => (
  <svg {...iconProps(size)} className={className}>
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

export const LibraryIcon: React.FC<IconProps> = ({ size, className }) => (
  <svg {...iconProps(size)} className={className}>
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
);

export const ReportIcon: React.FC<IconProps> = ({ size, className }) => (
  <svg {...iconProps(size)} className={className}>
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

export const ProfileIcon: React.FC<IconProps> = ({ size, className }) => (
  <svg {...iconProps(size)} className={className}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

export const LogoutIcon: React.FC<IconProps> = ({ size, className }) => (
  <svg {...iconProps(size)} className={className}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

export const SearchIcon: React.FC<IconProps> = ({ size, className }) => (
  <svg {...iconProps(size)} className={className}>
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

export const AudioIcon: React.FC<IconProps> = ({ size, className }) => (
  <svg {...iconProps(size)} className={className}>
    <path d="M9 18V5l12-2v13" />
    <circle cx="6" cy="18" r="3" />
    <circle cx="18" cy="16" r="3" />
  </svg>
);

export const VideoIcon: React.FC<IconProps> = ({ size, className }) => (
  <svg {...iconProps(size)} className={className}>
    <polygon points="23 7 16 12 23 17 23 7" />
    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
  </svg>
);

export const PdfIcon: React.FC<IconProps> = ({ size, className }) => (
  <svg {...iconProps(size)} className={className}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

export const UrlIcon: React.FC<IconProps> = ({ size, className }) => (
  <svg {...iconProps(size)} className={className}>
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

export const TextIcon: React.FC<IconProps> = ({ size, className }) => (
  <svg {...iconProps(size)} className={className}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <line x1="10" y1="9" x2="8" y2="9" />
  </svg>
);

export const CheckIcon: React.FC<IconProps> = ({ size, className }) => (
  <svg {...iconProps(size)} className={className}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export const ClockIcon: React.FC<IconProps> = ({ size, className }) => (
  <svg {...iconProps(size)} className={className}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

export const AwardIcon: React.FC<IconProps> = ({ size, className }) => (
  <svg {...iconProps(size)} className={className}>
    <circle cx="12" cy="8" r="6" />
    <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
  </svg>
);

export const ArrowRightIcon: React.FC<IconProps> = ({ size, className }) => (
  <svg {...iconProps(size)} className={className}>
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

export const ChevronLeftIcon: React.FC<IconProps> = ({ size, className }) => (
  <svg {...iconProps(size)} className={className}>
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

export const MenuIcon: React.FC<IconProps> = ({ size, className }) => (
  <svg {...iconProps(size)} className={className}>
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

export const XIcon: React.FC<IconProps> = ({ size, className }) => (
  <svg {...iconProps(size)} className={className}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export const TargetIcon: React.FC<IconProps> = ({ size, className }) => (
  <svg {...iconProps(size)} className={className}>
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

export const PodcastIcon: React.FC<IconProps> = ({ size, className }) => (
  <svg {...iconProps(size)} className={className}>
    <path d="M18 8a6 6 0 0 0-12 0" />
    <path d="M22 8a10 10 0 0 0-20 0" />
    <circle cx="12" cy="12" r="2" />
    <line x1="12" y1="14" x2="12" y2="21" />
  </svg>
);

export const contentTypeIcons: Record<string, React.FC<IconProps>> = {
  audio: AudioIcon,
  video: VideoIcon,
  pdf: PdfIcon,
  url: UrlIcon,
  text: TextIcon,
  podcast: PodcastIcon,
};
