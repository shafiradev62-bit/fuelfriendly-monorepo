import React, { useMemo, useState } from 'react';
import { CheckCircle } from 'lucide-react';

export const DEFAULT_FUEL_FRIEND_AVATAR = '/fuel-friend-avatar.svg';

interface FuelFriendAvatarProps {
  src?: string | null;
  alt: string;
  sizeClassName?: string;
  className?: string;
  showBadge?: boolean;
  eager?: boolean;
}

const FuelFriendAvatar: React.FC<FuelFriendAvatarProps> = ({
  src,
  alt,
  sizeClassName = 'w-12 h-12',
  className = '',
  showBadge = false,
  eager = false
}) => {
  const resolvedSrc = useMemo(() => src || DEFAULT_FUEL_FRIEND_AVATAR, [src]);
  const [imageSrc, setImageSrc] = useState(resolvedSrc);

  React.useEffect(() => {
    setImageSrc(resolvedSrc);
  }, [resolvedSrc]);

  return (
    <div className={`relative inline-flex shrink-0 ${sizeClassName}`}>
      <img
        src={imageSrc}
        alt={alt}
        className={`w-full h-full rounded-full object-cover bg-white ring-2 ring-white shadow-sm ${className}`}
        loading={eager ? 'eager' : 'lazy'}
        decoding={eager ? 'sync' : 'async'}
        onError={() => setImageSrc(DEFAULT_FUEL_FRIEND_AVATAR)}
      />
      {showBadge && (
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center shadow-sm ring-2 ring-white">
          <CheckCircle className="w-3 h-3 text-white" />
        </div>
      )}
    </div>
  );
};

export default FuelFriendAvatar;
