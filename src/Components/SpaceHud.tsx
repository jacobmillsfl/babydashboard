import React, { ReactNode } from 'react';

type SpaceHudProps = {
  children?: ReactNode;
};

function SpaceHud({ children }: SpaceHudProps) {
  return (
    <div
      className="mt-8 text-sky-200"
      style={{
        backgroundImage: 'url("/assets/space_hud_01_t85.png")',
        maxWidth: "800px",
        height: "100vh",
        backgroundSize: "contain",
        backgroundRepeat: "no-repeat",
        padding: "70px 80px 60px 30px",
        marginLeft: "auto",
        marginRight: "auto"
      }}
    >
      {children}
    </div>
  );
}

export default SpaceHud;
