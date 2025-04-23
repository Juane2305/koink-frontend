import { useEffect, useState } from "react";

interface SelectAvatarProps {
  value: string;
  onChange: (value: string) => void;
  onClose?: () => void;
}

const avatarList = Array.from({ length: 12 }).map(
  (_, i) => `/avatars/avatar${i + 1}.png`
);

export const SelectAvatar = ({ value, onChange, onClose }: SelectAvatarProps) => {
  const [selected, setSelected] = useState(value);

  useEffect(() => {
    setSelected(value);
  }, [value]);

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-3 sm:flex sm:flex-wrap justify-center gap-4 mt-2">
        {avatarList.map((url) => (
          <div
            key={url}
            className={`rounded-full border-2 p-1 transition cursor-pointer w-24 h-24 md:w-32 md:h-32 flex items-center justify-center 
              ${selected === url ? "border-emerald-500" : "border-transparent"}`}
            onClick={() => {
              setSelected(url);
              onChange(url);
              onClose?.()
            }}
          >
            <img
              src={url}
              alt="avatar"
              className="rounded-full w-full h-full object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
};
