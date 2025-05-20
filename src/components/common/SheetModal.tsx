import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

export function SheetModal({
  children,
  title,
  isSheetOpen,
  onOpenChange,
  className,
}: {
  children: React.ReactNode;
  title: string;
  isSheetOpen: boolean;
  onOpenChange: () => void;
  className: string;
}) {
  return (
    <Sheet
      open={isSheetOpen}
      onOpenChange={onOpenChange}
      defaultOpen={isSheetOpen}
    >
      <SheetContent className={className}>
        <SheetHeader className="h-10 items-center">
          <SheetTitle>{title}</SheetTitle>
        </SheetHeader>
        {children}
      </SheetContent>
    </Sheet>
  );
}
