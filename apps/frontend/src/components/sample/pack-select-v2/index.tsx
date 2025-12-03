import { useState } from "react";
import { ASSETS } from "./constants";
import { ResultScreen } from "./result-screen";
import { ThreeExperience } from "./three-experience";

type Stage = "experience" | "result";

export function PackSelectV2Sample() {
  const [stage, setStage] = useState<Stage>("experience");

  const handleComplete = () => setStage("result");
  const reset = () => setStage("experience");

  return (
    <div className="w-full h-screen bg-gray-900 flex flex-col items-center justify-center relative overflow-hidden select-none">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-black opacity-80 z-0" />

      {stage === "experience" && (
        <div className="z-10 w-full h-full animate-fade-in">
          <ThreeExperience
            cards={ASSETS.cards}
            assets={ASSETS}
            onComplete={handleComplete}
          />
        </div>
      )}

      {stage === "result" && (
        <ResultScreen cards={ASSETS.cards} onReset={reset} />
      )}
    </div>
  );
}
