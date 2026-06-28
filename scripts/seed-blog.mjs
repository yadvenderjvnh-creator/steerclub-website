import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

const POSTS = [
  {
    slug: "you-passed-the-test-now-what",
    title: "You passed the test. Now what?",
    excerpt: "The honest guide to actually learning to drive after getting your license. No one tells you this part.",
    category: "technique",
    readTime: 8,
    content: `The driving test in India has one job: confirm you can start a car and move it forward without immediate catastrophe.\n\nThat's it. That's the entire brief.\n\n## The gap nobody talks about\n\nIndia licenses millions of new drivers every year, most with a handful of lessons aimed at passing the RTO test — not at driving. The skills that matter — reading traffic, anticipating hazards, managing speed in conditions — are not tested, and not taught.\n\n## What actually helps\n\n**1. Structured first successes.** Drive a familiar, low-traffic route consistently until it stops producing anxiety.\n\n**2. Understanding what you're afraid of.** Most driving anxiety concentrates on one or two situations — parking, merging, night, rain. Knowing which is half the work.\n\n**3. A number to work toward.** The Steer Score makes improvement visible and real.\n\nYour license was the beginning. This is what comes next.\n\n— SteerClub Team`,
  },
  {
    slug: "why-your-mirrors-are-probably-wrong",
    title: "Why your mirrors are probably set wrong — and how to fix it in 60 seconds",
    excerpt: "Most drivers have their mirrors positioned to avoid blind spots incorrectly. Here's the method that works.",
    category: "technique",
    readTime: 4,
    content: `Most drivers set their side mirrors to see the side of their own car. That's wasted glass — you already know where your car is.\n\n## The fix\n\nLean your head against the driver window and set the left mirror so you just barely see the side of the car. Lean right to the centre console and set the right mirror the same way. Now the mirrors cover the zones your rear-view can't.\n\n**Result:** a car overtaking moves from your rear-view, to your side mirror, to your peripheral vision — with no gap where it disappears. No more blind-spot surprises.\n\n— SteerClub Team`,
  },
  {
    slug: "driving-in-bangalore-rain",
    title: "Driving in Bangalore rain: an honest guide",
    excerpt: "The city floods in 20 minutes. Traffic turns aggressive. Here's what you actually need to know.",
    category: "city-guides",
    readTime: 6,
    content: `Bangalore rain isn't gentle. The city floods in twenty minutes, drains overflow, and traffic turns into a contact sport.\n\n## Before you drive\n\nCheck your wipers and tyre tread now, not when it's pouring. Bald tyres on Bangalore tarmac aquaplane at surprisingly low speeds.\n\n## In the rain\n\nDouble your following distance. Use headlights, not high-beams. Avoid the deepest-looking water — half a metre is enough to stall an engine. If you can't see the road markings, slow to a speed where you can.\n\n— SteerClub Team`,
  },
  {
    slug: "atal-tunnel-driving-guide",
    title: "How to drive the Atal Tunnel: what nobody tells you",
    excerpt: "India's longest road tunnel. 9km of darkness. The preparation most drivers skip.",
    category: "routes",
    readTime: 7,
    content: `The Atal Tunnel is 9km of straight, dark, cold road under the Rohtang massif — and it catches unprepared drivers off guard.\n\n## Before the tunnel\n\nFuel up at Manali. Clean your windscreen. Switch headlights on before you enter — your eyes need the help adjusting.\n\n## Inside\n\nMaintain the posted speed and a strict following distance; there are cameras and marked gaps for a reason. No stopping, no photos, no lane changes. Exit into bright snow-glare — sunglasses help.\n\n— SteerClub Team`,
  },
  {
    slug: "woman-breaking-down-highway",
    title: "A woman's guide to breaking down alone on a highway",
    excerpt: "Practical. Specific. No fear-mongering. What to do, in order, when it happens.",
    category: "technique",
    readTime: 10,
    content: `Breaking down alone is manageable if you know the order of operations. No fear-mongering — just the steps.\n\n## In order\n\n**1. Get off the road.** Coast to the left shoulder, as far from traffic as possible.\n\n**2. Hazards on.** Immediately.\n\n**3. Stay in the car** if traffic is fast and close — a vehicle is safer than standing on a shoulder.\n\n**4. Call for help.** Highway helpline, a known mechanic, or roadside assistance. Share your live location with someone you trust.\n\n**5. Be visible.** A reflective triangle 50–100m behind, if you have one and it's safe to place.\n\nPreparation beats panic. Keep a charged power bank, the helpline number saved, and your assistance plan handy.\n\n— SteerClub Team`,
  },
  {
    slug: "overconfident-drivers-score",
    title: "What happens when overconfident drivers take the Steer Score",
    excerpt: "They think they're above average. The score disagrees. What it reveals — and what they do next.",
    category: "member-stories",
    readTime: 5,
    content: `Almost everyone rates themselves an above-average driver. The Steer Score is where that belief meets evidence.\n\n## The pattern\n\nConfident drivers tend to score well on vehicle control and badly on hazard perception and defensive driving — the invisible skills. The number is uncomfortable precisely because it's specific.\n\n## What they do next\n\nThe good ones don't argue with the score. They pick the one dimension dragging them down and work it. Capability is earned, not assumed.\n\n— SteerClub Team`,
  },
];

for (const p of POSTS) {
  await sql`
    insert into blog_posts (slug, title, excerpt, content, category, author_name, read_time_minutes, is_published, published_at, meta_title, meta_description)
    values (${p.slug}, ${p.title}, ${p.excerpt}, ${p.content}, ${p.category}, 'SteerClub Team', ${p.readTime}, true, now(), ${p.title.slice(0, 70)}, ${p.excerpt.slice(0, 160)})
    on conflict (slug) do update set
      title = excluded.title, excerpt = excluded.excerpt, content = excluded.content,
      category = excluded.category, read_time_minutes = excluded.read_time_minutes,
      is_published = true, meta_title = excluded.meta_title, meta_description = excluded.meta_description,
      updated_at = now()
  `;
  console.log("seeded", p.slug);
}
console.log("done — 6 posts");
