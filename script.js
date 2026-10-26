/* IQScore Fun - 20 question IQ practice test.
   Each attempt picks 7 Math + 7 Logic + 6 Visual questions at random from a larger
   question bank, mixes the categories through the test, and shuffles the answer options.
   Runs fully in the browser. No external libraries. */

const TOTAL_SECONDS = 20 * 60;
const CATS = { math: "Math Puzzles", logic: "Logical Reasoning", visual: "Visual Pattern Recognition" };

/* ---------- Visual figure drawing (inline SVG, colors come from the page theme) ---------- */
const S_STROKE = "stroke:var(--figs);stroke-width:3;stroke-linejoin:round;";
const fillOf = on => "fill:" + (on ? "var(--figf)" : "none") + ";";
const MPOS = [[[32,32]], [[20,32],[44,32]], [[32,18],[18,44],[46,44]], [[20,20],[44,20],[20,44],[44,44]]];
const MRAD = [15, 11, 9, 9];

function fig(f) {
  let s = "";
  if (f.t === "poly") {
    const n = f.n, start = -90 + (n === 4 ? 45 : 0) + (f.rot || 0), pts = [];
    for (let i = 0; i < n; i++) {
      const a = (start + i * 360 / n) * Math.PI / 180;
      pts.push((40 + 27 * Math.cos(a)).toFixed(1) + "," + (40 + 27 * Math.sin(a)).toFixed(1));
    }
    s = '<polygon points="' + pts.join(" ") + '" style="' + fillOf(f.fill) + S_STROKE + '"/>';
  } else if (f.t === "circ") {
    s = '<circle cx="40" cy="40" r="' + f.r + '" style="' + fillOf(f.fill) + S_STROKE + '"/>';
  } else if (f.t === "dots") {
    const pos = [[40,40],[20,20],[60,60],[60,20],[20,60],[40,20],[40,60],[20,40],[60,40]];
    for (let i = 0; i < f.n; i++) s += '<circle cx="' + pos[i][0] + '" cy="' + pos[i][1] + '" r="6" style="fill:var(--figf)"/>';
  } else if (f.t === "half") {
    const r = { left: [14,14,26,52], top: [14,14,52,26], right: [40,14,26,52], bottom: [14,40,52,26] }[f.d];
    s = '<rect x="' + r[0] + '" y="' + r[1] + '" width="' + r[2] + '" height="' + r[3] + '" style="fill:var(--figf)"/>' +
        '<rect x="14" y="14" width="52" height="52" style="fill:none;' + S_STROKE + '"/>';
  } else if (f.t === "m") {            /* shape (0 circle, 1 square, 2 triangle) repeated n times */
    const r = MRAD[f.n - 1], st = 'style="' + fillOf(f.fill) + "stroke:var(--figs);stroke-width:2.4;stroke-linejoin:round;" + '"';
    s = '<g transform="scale(1.25)">';
    MPOS[f.n - 1].forEach(p => {
      const x = p[0], y = p[1], tf = 'transform="rotate(' + (f.rot || 0) + " " + x + " " + y + ')"';
      s += f.s === 0 ? '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" ' + st + " " + tf + "/>"
         : f.s === 1 ? '<rect x="' + (x - r) + '" y="' + (y - r) + '" width="' + 2 * r + '" height="' + 2 * r + '" ' + st + " " + tf + "/>"
         : '<polygon points="' + x + "," + (y - r) + " " + (x + r) + "," + (y + r) + " " + (x - r) + "," + (y + r) + '" ' + st + " " + tf + "/>";
    });
    s += "</g>";
  }
  return '<svg class="fig" viewBox="0 0 80 80" aria-hidden="true">' + s + "</svg>";
}
const P = (n, rot, fill) => ({ t: "poly", n: n, rot: rot || 0, fill: !!fill });
const C = (r, fill) => ({ t: "circ", r: r, fill: !!fill });
const D = n => ({ t: "dots", n: n });
const H = d => ({ t: "half", d: d });
const X = a => a && ({ t: "m", s: a[0], n: a[1], fill: !!a[2], rot: a[3] || 0 });   /* null stays null = the "?" cell */

/* ---------- Question bank ----------  a = index of the correct option (before shuffling) */
const MATH = [
  { c: "math", q: "What number comes next?  2, 6, 12, 20, 30, ?", o: ["36", "40", "42", "44"], a: 2, e: "The gaps grow by 2 each time (4, 6, 8, 10, 12), so 30 + 12 = 42." },
  { c: "math", q: "What number comes next?  3, 6, 11, 18, 27, ?", o: ["36", "38", "40", "42"], a: 1, e: "The gaps are 3, 5, 7, 9, so the next gap is 11 and 27 + 11 = 38." },
  { c: "math", q: "What number comes next?  2, 3, 5, 9, 17, ?", o: ["25", "31", "33", "35"], a: 2, e: "The gaps double each time (1, 2, 4, 8), so the next gap is 16 and 17 + 16 = 33." },
  { c: "math", q: "What is 3/4 of 2/3 of 24?", o: ["8", "10", "12", "16"], a: 2, e: "2/3 of 24 = 16, then 3/4 of 16 = 12." },
  { c: "math", q: "Sam is twice as old as Ben. In 5 years their ages will add up to 40. How old is Sam now?", o: ["10", "15", "20", "25"], a: 2, e: "Let Ben = b. (b + 5) + (2b + 5) = 40, so b = 10 and Sam = 20." },
  { c: "math", q: "A train travels 60 miles in 45 minutes. At the same speed, how far will it go in 2 hours?", o: ["120 miles", "140 miles", "160 miles", "180 miles"], a: 2, e: "60 miles in 45 minutes is 80 miles per hour, so in 2 hours it travels 160 miles." },
  { c: "math", q: "A bat and a ball cost $1.10 together. The bat costs $1.00 more than the ball. How much does the ball cost?", o: ["10 cents", "5 cents", "15 cents", "1 cent"], a: 1, e: "Ball = 5 cents, bat = $1.05 (exactly $1.00 more), total $1.10." },
  { c: "math", q: "What number comes next?  2, 6, 18, 54, ?", o: ["162", "108", "148", "216"], a: 0, e: "Each number is multiplied by 3, so 54 x 3 = 162." },
  { c: "math", q: "What is 15% of 240?", o: ["36", "24", "30", "40"], a: 0, e: "10% of 240 is 24 and 5% is 12, so 15% is 36." },
  { c: "math", q: "Three notebooks cost $4.50. How much do eight notebooks cost?", o: ["$12.00", "$10.50", "$13.50", "$14.00"], a: 0, e: "One notebook costs $1.50, so eight cost $12.00." },
  { c: "math", q: "What number comes next?  1, 1, 2, 3, 5, 8, ?", o: ["13", "11", "12", "15"], a: 0, e: "Each number is the sum of the two before it (Fibonacci): 5 + 8 = 13." },
  { c: "math", q: "What number comes next?  7, 10, 16, 28, ?", o: ["52", "44", "48", "56"], a: 0, e: "The gaps double each time (3, 6, 12), so the next gap is 24 and 28 + 24 = 52." },
  { c: "math", q: "Two numbers add up to 25 and differ by 7. What is their product?", o: ["144", "126", "150", "168"], a: 0, e: "The numbers are 16 and 9 (16 + 9 = 25, 16 - 9 = 7), and 16 x 9 = 144." }
];

const LOGIC = [
  { c: "logic", q: "All bloops are razzies. All razzies are lazzies. Which statement must be true?", o: ["All lazzies are bloops", "All bloops are lazzies", "Some razzies are not lazzies", "No bloops are lazzies"], a: 1, e: "Bloops sit inside razzies, and razzies sit inside lazzies, so every bloop is a lazzie." },
  { c: "logic", q: "If 5 machines make 5 widgets in 5 minutes, how long would 100 machines need to make 100 widgets?", o: ["5 minutes", "20 minutes", "50 minutes", "100 minutes"], a: 0, e: "Each machine makes one widget in 5 minutes, so 100 machines make 100 widgets in 5 minutes." },
  { c: "logic", q: "In a race, Anna finished after Carl but before Ben. Dan finished after Ben. Who finished second?", o: ["Carl", "Anna", "Ben", "Dan"], a: 1, e: "The order is Carl, Anna, Ben, Dan. Anna was second." },
  { c: "logic", q: "You face north. You turn right, then right again, then left. Which way are you facing now?", o: ["North", "East", "South", "West"], a: 1, e: "North, then east, then south, then (turning left) east." },
  { c: "logic", q: "Which word does NOT belong?  Quickly, Slowly, Happily, Table", o: ["Quickly", "Slowly", "Happily", "Table"], a: 3, e: "Quickly, slowly and happily are adverbs. Table is a noun." },
  { c: "logic", q: "Doctor is to Hospital as Teacher is to ...?", o: ["Student", "Book", "School", "Lesson"], a: 2, e: "A doctor works in a hospital; a teacher works in a school." },
  { c: "logic", q: "Which number does NOT belong?  16, 25, 36, 48, 49", o: ["16", "25", "48", "49"], a: 2, e: "All the others are perfect squares (4x4, 5x5, 6x6, 7x7). 48 is not." },
  { c: "logic", q: "Which shape does not belong: triangle, square, pentagon, circle?", o: ["Circle", "Triangle", "Square", "Pentagon"], a: 0, e: "The triangle, square and pentagon are all made of straight sides and corners. The circle has neither." },
  { c: "logic", q: "Book is to reading as fork is to ...?", o: ["eating", "kitchen", "metal", "cooking"], a: 0, e: "A book is used for reading; a fork is used for eating. The link is the tool and its purpose." },
  { c: "logic", q: "Sam is taller than Ria. Ria is taller than Lee. Kai is shorter than Lee but taller than Joe. Who is second shortest?", o: ["Kai", "Lee", "Ria", "Joe"], a: 0, e: "From tallest to shortest: Sam, Ria, Lee, Kai, Joe. The second shortest is Kai." },
  { c: "logic", q: "If BAD is written as CBE, how is HOT written?", o: ["IPU", "HPU", "IOU", "GNS"], a: 0, e: "Each letter moves one step forward in the alphabet (B>C, A>B, D>E), so H>I, O>P, T>U gives IPU." },
  { c: "logic", q: "All roses are flowers. Some flowers fade quickly. Which conclusion is the only safe one?", o: ["Some roses could fade quickly.", "All roses fade quickly.", "No roses fade quickly.", "All flowers are roses."], a: 0, e: "We only know that some flowers fade quickly, so roses might be among them, but nothing more is guaranteed." },
  { c: "logic", q: "At 3:15, what is the angle between the hour hand and the minute hand?", o: ["7.5°", "0°", "15°", "22.5°"], a: 0, e: "The minute hand is at 90°. The hour hand is at 3 x 30° + 7.5° = 97.5°. The difference is 7.5°." }
];

const VISUAL = [
  { c: "visual", q: "Which figure comes next in the sequence?", cols: 4, seq: [P(3, 0), P(3, 90), P(3, 180), null],
    v: [P(3, 0), P(3, 90), P(3, 270), P(3, 180)], a: 2, e: "The triangle turns 90 degrees clockwise each step: up, right, down, so the next one points left." },
  { c: "visual", q: "Which figure comes next in the sequence?", cols: 4, seq: [D(1), D(2), D(3), null],
    v: [D(3), D(4), D(5), D(6)], a: 1, e: "One more dot is added each step: 1, 2, 3, so the next figure has 4 dots." },
  { c: "visual", q: "Which figure comes next in the sequence?", cols: 3, seq: [P(4, 0, true), C(24, false), P(3, 0, true), P(4, 0, false), C(24, true), null],
    v: [P(3, 0, true), P(3, 0, false), P(4, 0, false), C(24, true)], a: 1, e: "Shapes repeat in the order square, circle, triangle, and the fill alternates filled / empty. Next: an empty triangle." },
  { c: "visual", q: "Which figure comes next in the sequence?", cols: 4, seq: [C(6, true), C(10, true), C(14, true), null],
    v: [C(22, true), C(10, true), C(18, true), C(14, true)], a: 2, e: "The circle's radius grows by 4 each step (6, 10, 14), so the next radius is 18." },
  { c: "visual", q: "Which figure comes next in the sequence?", cols: 4, seq: [H("left"), H("top"), H("right"), null],
    v: [H("left"), H("right"), H("bottom"), H("top")], a: 2, e: "The shaded half moves clockwise: left, top, right, so next is the bottom half." },
  { c: "visual", q: "Which figure comes next in the sequence?", cols: 4, seq: [P(3, 0, false), P(4, 0, false), P(5, 0, false), null],
    v: [P(5, 0, false), P(6, 0, false), P(8, 0, false), C(26, false)], a: 1, e: "The number of sides goes up by one each step: 3, 4, 5, so the next shape has 6 sides." },
  { c: "visual", q: "Which option continues the sequence?", cols: 4, seq: [X([1,1,1]), X([1,2,1]), X([1,3,1]), null],
    v: [X([1,4,1]), X([1,2,1]), X([0,4,1]), X([2,3,1])], a: 0, e: "The number of squares goes up by one each step (1, 2, 3), so the next cell has 4 squares." },
  { c: "visual", q: "Which option completes the pattern?", cols: 3, seq: [X([0,1,1]), X([0,1,0]), X([1,1,1]), X([1,1,0]), X([2,1,1]), null],
    v: [X([2,1,0]), X([2,1,1]), X([0,1,0]), X([1,1,0])], a: 0, e: "Shapes go circle, square, triangle, and each shape appears filled and then empty. The missing cell is an empty triangle." },
  { c: "visual", q: "The triangle keeps turning. Which comes next?", cols: 4, seq: [X([2,1,1,0]), X([2,1,1,90]), X([2,1,1,180]), null],
    v: [X([2,1,1,270]), X([2,1,1,0]), X([2,1,1,90]), X([2,1,1,45])], a: 0, e: "The triangle turns 90 degrees clockwise each step (0, 90, 180), so the next turn is 270 degrees." },
  { c: "visual", q: "Each row and column uses every shape once. What replaces the question mark?", cols: 3,
    seq: [X([0,1,0]), X([1,1,0]), X([2,1,0]), X([1,1,0]), X([2,1,0]), X([0,1,0]), X([2,1,0]), X([0,1,0]), null],
    v: [X([1,1,0]), X([0,1,0]), X([2,1,0]), X([1,1,1])], a: 0, e: "Circle and triangle are already used in the last row and in the last column, so the missing shape is the empty square." },
  { c: "visual", q: "The shape and the count both follow a rule. What comes next?", cols: 4, seq: [X([0,1,1]), X([2,2,1]), X([1,3,1]), null],
    v: [X([0,4,1]), X([1,4,1]), X([0,3,1]), X([2,4,1])], a: 0, e: "The shapes cycle circle, triangle, square, and the count rises by one each step, so next is 4 circles." },
  { c: "visual", q: "In each row, the third cell follows a rule based on the first two. What replaces the question mark?", cols: 3,
    seq: [X([2,1,1]), X([2,1,1]), X([2,2,1]), X([2,1,1]), X([2,2,1]), X([2,3,1]), X([2,2,1]), X([2,2,1]), null],
    v: [X([2,4,1]), X([2,3,1]), X([2,2,1]), X([2,1,1])], a: 0, e: "In every row the third cell has as many triangles as the first two cells added together (1+1=2, 1+2=3, 2+2=4)." }
];

/* ---------- Building one attempt ---------- */
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
function pick(pool, n) { return shuffle(pool.slice()).slice(0, n); }

function makeQuestion(raw) {                      /* copy with shuffled options */
  const list = raw.v || raw.o, idx = shuffle(list.map((_, i) => i)), out = Object.assign({}, raw);
  const mixed = idx.map(i => list[i]);
  out.a = idx.indexOf(raw.a);
  if (raw.v) out.v = mixed; else out.o = mixed;
  return out;
}

/* Categories are interleaved: every group of three has one Math, one Logic and one Visual question
   (in random order), so visual questions appear all through the test, not only at the end. */
function buildTest() {
  const m = pick(MATH, 7), l = pick(LOGIC, 7), v = pick(VISUAL, 6), out = [];
  for (let r = 0; r < 6; r++) out.push(...shuffle([m[r], l[r], v[r]]));
  out.push(...shuffle([m[6], l[6]]));
  return out.map(makeQuestion);
}

/* ---------- State ---------- */
let QUESTIONS = [], cur = 0, answers = [], endTime = 0, timer = null, finished = false;
const $ = id => document.getElementById(id);
const letter = i => String.fromCharCode(65 + i);
const esc = t => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;");
const fmt = s => Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0");

/* ---------- Flow ---------- */
function startTest() {
  QUESTIONS = buildTest();
  answers = new Array(QUESTIONS.length).fill(null);
  cur = 0; finished = false;
  $("intro").classList.add("hidden");
  $("quiz").classList.remove("hidden");
  endTime = Date.now() + TOTAL_SECONDS * 1000;
  tick();
  timer = setInterval(tick, 500);
  render();
}

function tick() {
  if (finished) return;
  const left = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
  const t = $("timer");
  t.textContent = fmt(left);
  t.classList.toggle("warn", left <= 120);
  if (left === 0) finish(true);
}

function render() {
  const item = QUESTIONS[cur];
  $("qnum").textContent = "Question " + (cur + 1) + " of " + QUESTIONS.length;
  $("chip").textContent = CATS[item.c];
  $("bar").style.width = (cur / QUESTIONS.length * 100) + "%";
  $("qtext").textContent = item.q;

  const seq = $("seq");
  if (item.seq) {
    seq.className = "seq" + (item.cols === 3 ? " grid3" : " grid4");
    seq.innerHTML = item.seq.map(f => f ? '<div class="box">' + fig(f) + "</div>" : '<div class="box qm">?</div>').join("");
  } else { seq.className = "seq hidden"; seq.innerHTML = ""; }

  const box = $("opts");
  box.className = "opts" + (item.v ? " vis" : "");
  box.innerHTML = "";
  const list = item.v || item.o;
  list.forEach((x, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "opt" + (answers[cur] === i ? " sel" : "");
    b.setAttribute("aria-label", "Option " + letter(i));
    b.innerHTML = '<span class="l">' + letter(i) + "</span>" + (item.v ? fig(x) : "<span>" + esc(x) + "</span>");
    b.onclick = () => { answers[cur] = i; render(); };
    box.appendChild(b);
  });

  $("prev").disabled = cur === 0;
  $("next").textContent = cur === QUESTIONS.length - 1 ? "Finish & see result" : "Next";
  $("next").disabled = answers[cur] === null;

  const dots = $("dots"); dots.innerHTML = "";
  QUESTIONS.forEach((_, i) => {
    const d = document.createElement("i");
    d.className = (answers[i] !== null ? "done " : "") + (i === cur ? "now" : "");
    d.title = "Question " + (i + 1);
    d.onclick = () => { cur = i; render(); };
    dots.appendChild(d);
  });
}

function next() {
  if (answers[cur] === null) return;
  if (cur === QUESTIONS.length - 1) finish(false); else { cur++; render(); }
}
function prev() { if (cur > 0) { cur--; render(); } }

/* ---------- Scoring ---------- */
function estimateIQ(correct) { return Math.round(70 + 3.25 * correct); }

function tier(iq) {
  if (iq >= 130) return { name: "Exceptional (Genius range)", text: "Outstanding reasoning. Your estimated score is in the top 2% range." };
  if (iq >= 120) return { name: "Very Superior", text: "Excellent reasoning skills, well above average." };
  if (iq >= 110) return { name: "Superior", text: "Above-average reasoning. You spotted most of the patterns." };
  if (iq >= 90)  return { name: "Average", text: "A solid, typical score. About half of all people land in this range." };
  return { name: "Developing", text: "Below 90 on this short test. Practice puzzles and review the explanations to improve." };
}

function finish(timeUp) {
  if (finished) return;
  finished = true;
  clearInterval(timer);
  const used = Math.min(TOTAL_SECONDS, Math.round(TOTAL_SECONDS - Math.max(0, (endTime - Date.now()) / 1000)));
  const by = { math: [0, 0], logic: [0, 0], visual: [0, 0] };
  let correct = 0;
  QUESTIONS.forEach((q, i) => { by[q.c][1]++; if (answers[i] === q.a) { correct++; by[q.c][0]++; } });
  const iq = estimateIQ(correct), t = tier(iq);

  $("quiz").classList.add("hidden");
  $("result").classList.remove("hidden");
  $("timeup").classList.toggle("hidden", !timeUp);
  $("iq").textContent = iq;
  $("band").textContent = t.name;
  $("bandtext").textContent = t.text;
  $("detail").textContent = "You answered " + correct + " of " + QUESTIONS.length + " correctly in " + fmt(used) + ".";
  $("cats").innerHTML = Object.keys(by).map(k => "<div><b>" + by[k][0] + "/" + by[k][1] + "</b>" + CATS[k] + "</div>").join("");
  setTimeout(() => { $("marker").style.left = "calc(" + Math.max(0, Math.min(100, (iq - 70) / 70 * 100)) + "% - 2px)"; }, 100);

  const base = location.protocol.indexOf("http") === 0 ? location.origin : "https://iqscore.fun";
  const url = base + "/test.html";
  const msg = "I scored an estimated IQ of " + iq + " (" + t.name + ") on IQScore Fun! Can you beat me?";
  $("sw").href = "https://wa.me/?text=" + encodeURIComponent(msg + " " + url);
  $("sf").href = "https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(url) + "&quote=" + encodeURIComponent(msg);
  $("st").href = "https://twitter.com/intent/tweet?text=" + encodeURIComponent(msg) + "&url=" + encodeURIComponent(url);

  const rev = $("review"); rev.innerHTML = "";
  QUESTIONS.forEach((item, i) => {
    const ok = answers[i] === item.a, list = item.v || item.o;
    const show = k => k === null ? "no answer" : (item.v ? "Option " + letter(k) : esc(list[k]));
    const d = document.createElement("div"); d.className = "it";
    d.innerHTML = "<strong>" + (i + 1) + ". </strong>" + esc(item.q) + (item.seq ? " <em>(visual question)</em>" : "") +
      "<br><span class='" + (ok ? "ok" : "no") + "'>" + (ok ? "Correct" : "Incorrect") + "</span> - your answer: " + show(answers[i]) +
      (ok ? "" : " | correct: " + show(item.a)) + "<br><small>" + esc(item.e) + "</small>";
    rev.appendChild(d);
  });
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function retake() { location.reload(); }
