# Campus status badge

Wake path: `apps/mobile/src/components/teacher/CampusStatusBadge.tsx`.

The badge stays read-only. It does not mark attendance and it does not open a scanner. Copy is "At the gate", "Not arrived yet", or "Parent marked absent". A missing time omits the clock and still shows "At the gate".

Checked route `/(teacher)/roster` for role `teacher`. Empty search shows "No students match that search" and renders no badge. A non-homeroom class hides the roster tab; the screen also explains that attendance is only for the homeroom. Unknown statuses cannot occur: `CampusStatus` is a closed union.
