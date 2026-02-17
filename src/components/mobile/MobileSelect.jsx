import React, { useState, useEffect } from "react";
import { Check } from "lucide-react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export default function MobileSelect({ children, ...props }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (isMobile) {
    return <MobileSelectDrawer {...props}>{children}</MobileSelectDrawer>;
  }

  return <Select {...props}>{children}</Select>;
}

function MobileSelectDrawer({ value, onValueChange, children, ...props }) {
  const [open, setOpen] = useState(false);
  const [trigger, items] = React.Children.toArray(children);

  const handleSelect = (itemValue) => {
    onValueChange?.(itemValue);
    setOpen(false);
  };

  const selectedLabel = React.Children.toArray(items.props.children)
    .find(child => child.props.value === value)?.props.children;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex h-11 w-full items-center justify-between rounded-xl border px-3 py-2 text-sm"
        style={{ borderColor: 'var(--sand)', backgroundColor: 'var(--warm-white)' }}
        {...props}
      >
        <span style={{ color: 'var(--earth)' }}>
          {selectedLabel || trigger.props.children}
        </span>
        <svg
          width="15"
          height="15"
          viewBox="0 0 15 15"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="opacity-50"
        >
          <path
            d="M4.93179 5.43179C4.75605 5.60753 4.75605 5.89245 4.93179 6.06819C5.10753 6.24392 5.39245 6.24392 5.56819 6.06819L7.49999 4.13638L9.43179 6.06819C9.60753 6.24392 9.89245 6.24392 10.0682 6.06819C10.2439 5.89245 10.2439 5.60753 10.0682 5.43179L7.81819 3.18179C7.73379 3.0974 7.61933 3.04999 7.49999 3.04999C7.38064 3.04999 7.26618 3.0974 7.18179 3.18179L4.93179 5.43179ZM10.0682 9.56819C10.2439 9.39245 10.2439 9.10753 10.0682 8.93179C9.89245 8.75606 9.60753 8.75606 9.43179 8.93179L7.49999 10.8636L5.56819 8.93179C5.39245 8.75606 5.10753 8.75606 4.93179 8.93179C4.75605 9.10753 4.75605 9.39245 4.93179 9.56819L7.18179 11.8182C7.35753 11.9939 7.64245 11.9939 7.81819 11.8182L10.0682 9.56819Z"
            fill="currentColor"
            fillRule="evenodd"
            clipRule="evenodd"
          />
        </svg>
      </button>

      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent style={{ backgroundColor: 'var(--warm-white)' }}>
          <DrawerHeader>
            <DrawerTitle style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
              Select Option
            </DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-8 space-y-2">
            {React.Children.map(items.props.children, (child) => {
              if (child.type === SelectItem || child.props.value) {
                const isSelected = child.props.value === value;
                return (
                  <button
                    onClick={() => handleSelect(child.props.value)}
                    className="flex items-center justify-between w-full p-4 rounded-xl text-left transition-colors min-h-[44px]"
                    style={{
                      backgroundColor: isSelected ? 'var(--sand)' : 'transparent',
                      color: 'var(--earth)'
                    }}
                  >
                    <span className="font-normal">{child.props.children}</span>
                    {isSelected && <Check className="w-5 h-5" style={{ color: 'var(--terracotta)' }} />}
                  </button>
                );
              }
              return child;
            })}
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}

export { MobileSelect };