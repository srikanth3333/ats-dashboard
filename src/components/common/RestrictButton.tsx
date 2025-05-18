import { useUser } from "@/app/context/UserContext";
import { Button } from "@/components/ui/button";

import React from "react";

type RestrictButtonProps = {
  icon: React.ReactNode;
  btnTxt: React.ReactNode;
  variant?:
    | "link"
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "animated"
    | null;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  page?: string;
  type?: string | undefined;
};

function RestrictButton({
  icon,
  btnTxt,
  variant,
  onClick,
  page,
  type,
}: RestrictButtonProps) {
  const { user } = useUser();
  const checkBtn = user?.userProfile?.acess_roles?.find(
    (record: any) => record?.type == page
  );
  if (!type || !checkBtn || typeof checkBtn[type] === "undefined") {
    return null;
  }
  return checkBtn[type] === false ? null : (
    <Button variant={variant} onClick={onClick}>
      {icon} {btnTxt}
    </Button>
  );
}

export default RestrictButton;
