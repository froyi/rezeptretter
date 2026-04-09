import { Suspense } from "react";
import { ImportierenClient } from "./importieren-client";

export default function ImportierenPage() {
  return (
    <Suspense
      fallback={
        <div className="p-4 lg:p-8">
          <div className="max-w-4xl mx-auto space-y-8 animate-pulse">
            <div className="h-12 bg-surface-container rounded w-2/3" />
            <div className="h-6 bg-surface-container rounded w-1/2" />
            <div className="bg-surface-container-low p-8 rounded-xl space-y-6">
              <div className="h-16 bg-surface-container rounded-full" />
              <div className="h-14 bg-surface-container rounded-full w-64" />
            </div>
          </div>
        </div>
      }
    >
      <ImportierenClient />
    </Suspense>
  );
}
