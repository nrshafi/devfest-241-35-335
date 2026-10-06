/** Workflow order stays usable when there is no room for a checklist/sidebar. */
export function WorkspaceLayout({ uploads, checklist, readiness }) {
  return (
    <div className="grid min-w-0 grid-cols-1 gap-4 min-[1440px]:grid-cols-[minmax(0,1fr)_340px] min-[1440px]:grid-rows-[auto_1fr] min-[1440px]:items-start">
      <div className="min-w-0 min-[1440px]:col-start-2 min-[1440px]:row-start-1">
        {uploads}
      </div>
      <div className="min-w-0 min-[1440px]:col-start-1 min-[1440px]:row-span-2 min-[1440px]:row-start-1">
        {checklist}
      </div>
      <div className="min-w-0 min-[1440px]:col-start-2 min-[1440px]:row-start-2">
        {readiness}
      </div>
    </div>
  )
}
