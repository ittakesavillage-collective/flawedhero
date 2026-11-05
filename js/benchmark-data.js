// Phil's PRE-FORMANCE® Strength Benchmark: the nine tests, targets and the traffic-light check. Used by benchmark.html and My Movement.
// The nine tests, from Phil's PRE-FORMANCE® Strength Benchmark. sides: 2 = left and right, 1 = one result.
const TESTS = [
  { id: 'calf', n: 1, name: 'Single-Leg Calf Raise', area: 'Calf endurance', unit: 'reps', sides: 2, target: 25, l1: 'Left leg', l2: 'Right leg',
    how: 'Stand on one foot on the edge of a step or wedge (flat floor if no step available). Rise slowly onto toes: 1 second up, 1 second down. Count reps until form breaks: heel not reaching full height, or rocking for momentum. Test each leg separately.',
    why: 'The most loaded muscle in any endurance sport. Calf weakness is one of the most common causes of lower leg injury, and one of the easiest to prevent with consistent training.',
    start: 'Double-leg calf raise. Both feet on the step or floor, rise and lower together. 3 sets of 8-12 reps at 7/10 effort. Build to 3x20 before moving to the next step.',
    ex: 'Double-leg calf raise, then double up / single down', exBody: 'Start with double-leg calf raises: both feet rise together, both lower together. Build to 3x20 with control. Then progress to the bridge step: rise on two feet, lower slowly on one foot only (3 seconds down). This loads each calf eccentrically without needing full single-leg strength yet. Build to 3x12 each side, then move to single-leg.' },
  { id: 'bridge', n: 2, name: 'Single-Leg Hip Bridge', area: 'Glute strength and pelvic stability', unit: 'reps', sides: 2, target: 25, l1: 'Left leg', l2: 'Right leg',
    how: 'Lie on your back, one foot flat on the floor, other leg extended straight. Push hips up to a straight line from shoulders to knee. Hold 2 seconds at the top, 1 second down. Count reps each leg. Stop when hips drop, rotate, or you lose the hold.',
    why: 'Protects the IT band and lower back. The glutes are supposed to be the engine. Most runners compensate with their quads instead, which is where knee and hip problems come from.',
    start: 'Two-leg hip bridge. Both feet flat, push hips up, 2-second hold at top. 3 sets of 12-15 reps. Focus on a straight line from shoulders to knees, no sagging hips. Build to 3x25 before moving to single-leg.',
    ex: 'Two-leg hip bridge', exBody: 'Both feet flat on the floor. Push hips up to a straight line, hold 2 seconds, lower slowly. This is the foundation. Build to 3x25 with level hips and a solid hold before attempting single-leg.' },
  { id: 'sit', n: 3, name: 'Single-Leg Sit to Stand', area: 'Knee and glute strength', unit: 'reps', sides: 2, target: 22, l1: 'Left leg', l2: 'Right leg',
    how: 'Sit on a standard-height chair. Hold one foot slightly off the floor. Stand on the working leg without using hands: 1 second up, 1 second down. Count reps until you need hands or the movement collapses.',
    why: 'Replicates the single-leg loading of running and walking. If you cannot control this on a chair, you cannot control it when your legs are tired and the ground is uneven.',
    start: 'Eccentric single-leg lower. Stand on one leg, lower slowly to the chair over 3 seconds, stand back up using both legs. 3 sets of 8-10 each side. Control the whole way down; do not drop onto the chair.',
    ex: 'Eccentric single-leg squat (slow lower to chair)', exBody: 'Stand on one leg in front of the chair. Lower yourself slowly onto the chair over 3 seconds, as slowly and controlled as possible. Then stand up using both legs. This builds the eccentric strength needed for the full movement. Build to 3x10 controlled lowers before attempting the full sit-to-stand.' },
  { id: 'side', n: 4, name: 'Side Plank', area: 'Lateral core stability', unit: 'sec', sides: 2, target: 60, l1: 'Left side', l2: 'Right side',
    how: 'Forearm on the floor, feet stacked or staggered, body in a straight line from head to feet. Hips level, not sagging or piking. Time how long you can hold. Stop when hips drop more than a few centimetres.',
    why: 'Lateral core stability holds your movement together under fatigue. When it goes, hips drop, knees cave, and the IT band tightens: the chain reaction behind most overuse injuries.',
    start: 'Knee-down side plank. Bottom knee on the floor, body in a straight line from knee to head. Hold until hips drop. Multiple short sets with rest. Build your hold each session before moving to full side plank.',
    ex: 'Knee-down side plank (same side)', exBody: 'Same position but the bottom knee rests on the floor instead of feet stacked. Body still in a straight line from knee to head. Build to 60 seconds each side before moving to the full version. Important: the regression is done on the same side as the full plank, not a different exercise.' },
  { id: 'lunge', n: 5, name: 'Reverse Lunge', area: 'Running-specific leg strength', unit: 'reps', sides: 2, target: 20, l1: 'Left leg', l2: 'Right leg',
    how: 'Stand tall. Step one foot back, lower the back knee toward the floor: 1 second down, 1 second up. Drive back to standing. Count reps on each leg until balance breaks or the back knee hits the floor hard.',
    why: 'The closest strength movement to running and walking gait. Tests single-leg control, balance, and the deceleration strength that protects your knees on every descent and change of pace.',
    start: 'Supported reverse lunge. Hold a wall lightly with one hand. 3 sets of 8 each leg. Remove support as soon as balance allows, even if just for the last rep of each set.',
    ex: 'Supported reverse lunge', exBody: 'Hold a wall or sturdy chair back lightly with one hand for balance. Same movement: step back, lower the knee, drive up. Remove the support progressively as control improves. Build to 3x10 each leg without support before moving to the free-standing version.' },
  { id: 'wall', n: 6, name: 'Wall Sit', area: 'Quad endurance', unit: 'sec', sides: 1, target: 90, l1: 'Hold time',
    how: 'Back flat against the wall, thighs parallel to the floor, feet flat and hip-width apart. Hold. Stop when thighs rise above parallel or you push off the wall.',
    why: 'Quad failure is what makes the last 6 miles feel like a different, worse race. This is the test that predicts it most honestly.',
    start: 'Partial wall sit. Hips slightly above parallel (around 100-120 degrees knee bend). Hold until thighs start to give. Multiple short holds with rest. Gradually lower hips closer to parallel as strength builds.',
    ex: 'Partial wall sit (above parallel)', exBody: 'If 20 seconds at full parallel is not achievable, sit higher: less knee bend, more like 100-120 degrees rather than 90. Build your hold time at this position, then gradually lower your hips toward parallel over several sessions as strength improves.' },
  { id: 'balance', n: 7, name: 'Single-Leg Balance (eyes closed)', area: 'Proprioception and ankle stability', unit: 'sec', sides: 2, target: 30, l1: 'Left foot', l2: 'Right foot',
    how: 'Stand on one foot, arms relaxed at sides, eyes closed. Time how long you hold without the free foot touching down or grabbing for support. Test both legs separately.',
    why: 'Ankle instability is invisible until you are on uneven ground or fatigued. Eyes-closed balance strips out visual compensation and tests your true proprioception. Most people are shocked by how short this is. It gets longer fast.',
    start: 'Eyes-open single-leg balance. Stand on one foot, focus on a fixed point. Hold until you touch down, rest, repeat. Build to 30 seconds eyes open each foot before attempting eyes closed.',
    ex: 'Eyes-open single-leg balance', exBody: 'If you cannot hold 5 seconds with eyes closed, start with eyes open. Same position: one foot, arms relaxed. Build to 30 seconds eyes open on each foot before closing them. Eyes open first is not easy for everyone either.' },
  { id: 'knee', n: 8, name: 'Knee to Wall', area: 'Ankle dorsiflexion / calf flexibility', unit: 'cm', sides: 2, target: 9, restrictedBelow: 5, l1: 'Left foot (cm)', l2: 'Right foot (cm)',
    how: 'Stand facing a wall. Place one foot with toes touching the wall. Bend the knee forward to touch the wall, keeping the heel flat on the floor. If you can do this, move the foot back 1cm at a time until the heel just starts to lift. Measure the distance from the big toe to the wall. Test both legs.',
    why: 'Restricted ankle dorsiflexion is one of the most common underlying causes of calf and Achilles injuries in runners. It also affects knee tracking and hip mechanics further up the chain. Most people have no idea their ankle range is limited until they test it.',
    start: 'Daily calf stretching is urgent. Straight-leg calf stretch (gastrocnemius): heel on floor, lean into wall, 60 seconds each leg. Bent-knee calf stretch (soleus): same position but knee slightly bent, 60 seconds each leg. Three times daily. Retest weekly.',
    ex: 'Calf and Achilles mobility work', exBody: 'If you cannot reach 5cm: daily calf stretching is a priority before strength work. Straight-leg calf stretch (gastrocnemius) and bent-knee calf stretch (soleus), 60 seconds each, three times daily. This responds well to frequency.' },
  { id: 'reach', n: 9, name: 'Sit and Reach', area: 'Hamstring and lower back flexibility', unit: 'cm', sides: 1, target: 38, neg: true, l1: 'Distance reached (cm)',
    how: 'Sit on the floor with legs straight and feet flat against a wall or box. Reach forward as far as possible with both hands, keeping knees straight. Hold for 2 seconds at the furthest point. Measure the distance reached (past the feet is positive, short of feet is negative). No bouncing.',
    why: 'Hamstring tightness contributes to lower back pain, altered running gait, and reduced stride length. The sit and reach gives an objective measure of posterior chain flexibility, one of the most commonly neglected areas in runners.',
    start: 'Daily hamstring and hip flexor stretching is a priority. Seated hamstring stretch and standing hamstring stretch, 60 seconds each, twice daily. This takes weeks to months. Do not skip warm-up before any session.',
    ex: 'Daily hamstring stretching', exBody: 'If you are below target: seated hamstring stretch (legs straight, reach toward feet) and standing hamstring stretch, 60 seconds each, twice daily. Hip flexor stretching alongside. This takes weeks to months to improve, not days.' }
];
const U = { reps: 'reps', sec: 'sec', cm: 'cm' };
const KEY = 'fh.benchmark.sessions';

// Traffic light for one test from what has been typed. Needs every side filled in.
function judge(t, vals) {
  const have = vals.filter(v => v !== '' && v != null && !isNaN(+v)).map(Number);
  if (have.length < t.sides) return { s: 'n', label: have.length ? 'Enter both sides' : 'Not tested yet', done: false };
  const worst = Math.min(...have);
  if (t.restrictedBelow != null && worst < t.restrictedBelow) return { s: 'r', label: 'Restricted', done: true, worst, ok: false };
  if (worst >= t.target) return { s: 'g', label: 'At target', done: true, worst, ok: true };
  return { s: 'a', label: 'Below target', done: true, worst, ok: false };
}
