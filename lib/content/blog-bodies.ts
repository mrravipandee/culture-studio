/**
 * Article bodies for the four launch posts (lib/rich-text.ts JSON).
 *
 * Original, general guidance written for CULT.URE. They make no claims about clients,
 * results or statistics. COPY IN REVIEW: see BLOG_COPY_IN_REVIEW in lib/content/blog.ts,
 * which keeps these pages noindex and out of the sitemap until the team approves the text.
 */

import type { RichNode } from "@/lib/rich-text";

type Part = string | RichNode;

const text = (value: string): RichNode => ({ type: "text", text: value });
const bold = (value: string): RichNode => ({ type: "text", text: value, marks: [{ type: "bold" }] });
const em = (value: string): RichNode => ({ type: "text", text: value, marks: [{ type: "italic" }] });
const parts = (items: Part[]) => items.map((x) => (typeof x === "string" ? text(x) : x));

const p = (...items: Part[]): RichNode => ({ type: "paragraph", content: parts(items) });
const h2 = (value: string): RichNode => ({ type: "heading", attrs: { level: 2 }, content: [text(value)] });
const h3 = (value: string): RichNode => ({ type: "heading", attrs: { level: 3 }, content: [text(value)] });
const list = (type: "bulletList" | "orderedList", items: (Part | Part[])[]): RichNode => ({
  type,
  content: items.map((item) => ({ type: "listItem", content: [p(...(Array.isArray(item) ? item : [item]))] })),
});
const ul = (...items: (Part | Part[])[]) => list("bulletList", items);
const ol = (...items: (Part | Part[])[]) => list("orderedList", items);
const quote = (...items: Part[]): RichNode => ({ type: "blockquote", content: [p(...items)] });
const hr: RichNode = { type: "horizontalRule" };
const doc = (...nodes: RichNode[]): RichNode => ({ type: "doc", content: nodes });

/* ------------------------------------------------------------------------------------- */

export const memorableBrandBody = doc(
  p(
    "Most brands are not forgotten because they are bad. They are forgotten because they are interchangeable. The logo is fine, the website is clean, the posts go out on time, and yet nothing sticks. A memorable brand is not louder than everyone else; it is more ",
    em("specific"),
    ".",
  ),
  p("This piece walks through the elements that make a brand easy to recall, and how to build them deliberately instead of hoping they emerge."),

  h2("Memory needs something to hold on to"),
  p(
    "People do not remember brands as a whole. They remember fragments: a colour, a phrase, a feeling after an interaction, the way a founder explains the problem. Recall works when those fragments are ",
    bold("distinct"),
    ", ",
    bold("repeated"),
    " and ",
    bold("connected to a clear idea"),
    ". If any of the three is missing, the fragments drift apart and the brand blurs into its category.",
  ),
  p("So the work is less about inventing more assets and more about choosing a few, making them unmistakably yours, and using them with discipline."),

  h2("1. Start with a point of view, not a tagline"),
  p(
    "A tagline is the last step, not the first. Before any words are polished, a brand needs a point of view: what it believes about its category that others do not say out loud. That belief gives every later decision something to measure against.",
  ),
  p("A useful test is to finish this sentence honestly:"),
  quote("Most people in our category think ___. We believe ___, and that is why we ___."),
  p("If the answer could belong to any competitor, keep going. A point of view is only useful if someone could reasonably disagree with it."),

  h2("2. Choose your distinctive assets on purpose"),
  p(
    "Distinctive assets are the cues that signal ",
    em("this is us"),
    " before anyone reads the name. They can be visual or verbal, but they only work when they are consistent for long enough to be learned.",
  ),
  ul(
    [bold("Colour and composition: "), "one or two colours used with restraint are more ownable than a full palette used everywhere."],
    [bold("Typography: "), "a consistent typeface pairing quietly does a lot of recognition work."],
    [bold("Language: "), "recurring phrases, a naming pattern for products, a recognisable rhythm in how you write."],
    [bold("Behaviour: "), "how you onboard, reply, follow up and say thank you is also part of the brand."],
  ),
  p("Pick fewer assets than feels comfortable. Then audit every touchpoint and remove anything that dilutes them."),

  h2("3. Consistency beats novelty"),
  p(
    "Teams usually get bored of their own brand long before the audience has even noticed it. The temptation is to refresh the look, change the voice, try a new campaign idea every month. Each change resets the memory you were building.",
  ),
  p(
    "Treat consistency as a creative constraint rather than a limitation. Keep the core fixed and let execution vary: new stories, new formats, new collaborations, all expressed through the same recognisable system.",
  ),
  h3("What to keep fixed, what to flex"),
  ul(
    [bold("Fixed: "), "point of view, core visual assets, tone of voice, the promise you make."],
    [bold("Flexible: "), "campaign themes, formats, channels, seasonal stories, partnerships."],
  ),

  h2("4. Make the experience match the message"),
  p(
    "A brand is remembered as much for how it feels to deal with as for how it looks. If the ads promise ease and the checkout is confusing, the confusion is what people remember. The quickest way to make a brand memorable for the wrong reasons is a gap between promise and experience.",
  ),
  p("Map the moments that matter most to your audience (first visit, first purchase, first problem) and make sure each one reflects the same idea your marketing talks about."),

  h2("5. Tell the same story in many ways"),
  p(
    "Memorable brands do not tell many different stories. They tell one story from many angles: through the founder, through the product, through customers, through behind-the-scenes work. Each piece reinforces the same core idea, so the audience builds a clear picture over time instead of a collection of unrelated posts.",
  ),
  hr,
  h2("A simple checklist"),
  ol(
    "Can you state your point of view in one sentence that a competitor would not say?",
    "Have you chosen two or three distinctive assets, and are they used everywhere?",
    "Does every key touchpoint feel like the same brand?",
    "Is your content telling one story from different angles?",
    "Are you changing things because the audience needs it, or because the team is bored?",
  ),
  p("Being remembered is rarely the result of one big idea. It is the result of a clear idea, repeated well, for long enough that people start to recognise it without trying."),
);

/* ------------------------------------------------------------------------------------- */

export const positioningBody = doc(
  p(
    "Positioning is the decision about which space your brand should own in a customer's mind. Get it right and marketing becomes easier, sales conversations become shorter, and the right people start to self-select. Get it wrong, or skip it, and every channel has to work harder to explain who you are.",
  ),

  h2("What positioning actually is"),
  p(
    "Positioning is not your logo, your tagline or your mission statement. It is a set of choices: ",
    bold("who you are for"),
    ", ",
    bold("what you help them achieve"),
    ", ",
    bold("what you are compared against"),
    " and ",
    bold("why you are the better choice"),
    " for that specific person. Everything else (messaging, visuals, campaigns) should express those choices.",
  ),

  h2("Why it matters for growth"),
  p("When positioning is vague, growth tends to stall in predictable ways:"),
  ul(
    "Marketing attracts a broad audience, but only a small part of it is a real fit.",
    "Sales spends time educating prospects who were never going to buy.",
    "Pricing gets pulled down because the offer looks similar to cheaper alternatives.",
    "The team argues about messaging because there is no shared reference point.",
  ),
  p("Clear positioning does not guarantee growth, but it removes friction from every step that leads to it."),

  h2("The four building blocks"),
  h3("1. Your best-fit customer"),
  p(
    "Describe the customer who gets the most value from you, not everyone who could buy. Look at the people you already serve well: what do they have in common in terms of situation, ambition and frustration? That is your starting point.",
  ),
  h3("2. The real alternatives"),
  p(
    "Your competition is whatever the customer would do if you did not exist. That might be another agency, an in-house hire, a freelancer, a software tool or simply doing nothing. Knowing the true alternatives tells you what you need to be better than.",
  ),
  h3("3. Your distinctive strengths"),
  p("List what you do that those alternatives cannot or do not do. Be concrete: a way of working, a combination of skills, a depth of focus. Avoid generic claims like quality or passion; every competitor says the same."),
  h3("4. The value those strengths create"),
  p("Translate each strength into an outcome the customer cares about. A strength only matters when the customer can see what it changes for them."),

  quote("If you try to be for everyone, you end up being the default choice for no one."),

  h2("Turning positioning into a statement"),
  p("Once the building blocks are clear, a short internal statement keeps everyone aligned:"),
  p(em("For [best-fit customer] who [situation or need], we are the [category] that [key value], unlike [main alternative], because [distinctive strength].")),
  p(
    "This is not copy for the homepage. It is a reference the team uses to check whether a campaign, a service or a piece of content fits. Public messaging comes afterwards and can be far more expressive.",
  ),

  h2("Common mistakes"),
  ul(
    [bold("Positioning by aspiration: "), "describing the company you want to become rather than the value you deliver today."],
    [bold("Too many audiences: "), "trying to speak to several segments at once usually means speaking clearly to none."],
    [bold("Copying the category leader: "), "the leader already owns that space; a close imitation rarely wins it."],
    [bold("Never revisiting it: "), "markets move. Review your positioning when your offer, audience or competition changes."],
  ),

  h2("Where to start this week"),
  ol(
    "Write down the customers you have served best and what they had in common.",
    "List the alternatives they considered before choosing you.",
    "Note the strengths that made the difference, in their words if possible.",
    "Draft the positioning statement and test it against your current homepage.",
  ),
  p("Positioning is not a one-off exercise. It is the foundation that lets everything else you build scale in the same direction."),
);

/* ------------------------------------------------------------------------------------- */

export const performanceVsBrandBody = doc(
  p(
    "Few marketing debates are as persistent as performance versus brand. One promises measurable returns this month; the other promises stronger demand over time. In practice, the question is rarely which one to choose. It is how to balance them for the stage your business is in.",
  ),

  h2("Two jobs, not two rivals"),
  p(
    bold("Performance marketing"),
    " captures existing demand. It targets people who are already looking, nudges them to act and is measured through clicks, leads and sales. ",
    bold("Brand marketing"),
    " creates future demand. It shapes how people think and feel about you before they need you, so that when the need arrives, you are already on the shortlist.",
  ),
  p("They depend on each other. Performance channels work better when people already recognise and trust the name in the ad. Brand work pays off faster when there is a clear path to act once interest exists."),

  h2("Signs you are leaning too far one way"),
  h3("Too much performance"),
  ul(
    "Costs per lead keep rising while targeting and creative stay the same.",
    "Results drop sharply whenever spend is paused.",
    "You compete mostly on price and discounts.",
    "Few people search for your brand name directly.",
  ),
  h3("Too much brand"),
  ul(
    "People like your content but there is no clear next step.",
    "You cannot connect activity to enquiries or sales at all.",
    "Campaigns look great but the offer is hard to understand.",
  ),

  h2("A simple framework for deciding"),
  p("Instead of a fixed split, ask three questions and let the answers shape your mix."),
  h3("1. How established is demand for what you sell?"),
  p(
    "If people already search for your category, performance can capture that intent quickly. If you are introducing something new, or the category is crowded and undifferentiated, you need brand work to create or redirect demand.",
  ),
  h3("2. How long is your buying cycle?"),
  p(
    "Short, low-risk purchases respond well to direct response. Longer, considered decisions (services, higher-value products, B2B) depend more on trust and familiarity built over time, which is brand territory.",
  ),
  h3("3. What can you sustain?"),
  p(
    "Brand building only works with consistency over months, not weeks. If budget or attention is limited, it is better to commit to a smaller brand effort you can maintain than a large one you will abandon.",
  ),

  quote("Performance tells you what worked yesterday. Brand decides how many people will be ready to buy tomorrow."),

  h2("Making both work together"),
  ul(
    [bold("Use one creative system: "), "performance ads should look and sound like your brand, not like generic templates."],
    [bold("Retarget brand audiences: "), "people who watched or read your brand content are warmer prospects for performance campaigns."],
    [bold("Measure each by its own job: "), "judge performance on cost per result; judge brand on reach, recall, branded search and the quality of enquiries."],
    [bold("Review the mix regularly: "), "revisit the balance each quarter as your demand, offer and market change."],
  ),

  h2("The practical answer"),
  p(
    "If you need results now, start with performance to capture the demand that already exists, but invest from the beginning in a recognisable brand system so those campaigns get more efficient over time. If you are building something new or premium, lead with brand and add performance as soon as there is interest to capture.",
  ),
  p("The goal is not to win the debate. It is to build a marketing mix where today's results and tomorrow's demand support each other."),
);

/* ------------------------------------------------------------------------------------- */

export const contentThatConvertsBody = doc(
  p(
    "Plenty of content gets views. Far less of it changes what people do next. Content that converts is not about publishing more; it is about connecting what you create to the questions, doubts and decisions your audience actually has.",
  ),
  p("Here is a practical playbook for planning, creating and distributing content with a clear purpose."),

  h2("Step 1: Start with the decision, not the format"),
  p(
    "Before choosing between a reel, a carousel or a long article, decide which decision this piece should help someone make. Every piece of content should move a reader one step closer to a choice: understanding the problem, trusting your approach or taking action.",
  ),
  p("A helpful way to organise this is by stage:"),
  ul(
    [bold("Discover: "), "content that names a problem the audience recognises."],
    [bold("Consider: "), "content that explains approaches, trade-offs and how to choose."],
    [bold("Decide: "), "content that answers objections and shows how working with you actually works."],
  ),

  h2("Step 2: Mine real questions"),
  p("The best content ideas are usually already in your inbox. Collect the questions people ask before they buy:"),
  ul(
    "Questions from sales calls and enquiry forms.",
    "Comments and DMs on your social posts.",
    "Objections that come up repeatedly in proposals.",
    "Things customers wish they had known earlier.",
  ),
  p("Each recurring question is a piece of content that already has an audience waiting for it."),

  h2("Step 3: Create with a clear structure"),
  p("Content that converts tends to follow a simple shape, regardless of format:"),
  ol(
    [bold("Hook: "), "name the problem or question in the first line."],
    [bold("Value: "), "give a genuinely useful answer, not a teaser."],
    [bold("Proof: "), "show how you approach it, with process or real examples you are able to share."],
    [bold("Next step: "), "offer one clear, low-friction action."],
  ),
  quote("If someone finishes your content and does not know what to do next, the content did half its job."),

  h2("Step 4: Make the next step obvious"),
  p(
    "A call to action does not need to be a hard sell. It should match the stage of the reader. Someone discovering a problem might want a related guide; someone deciding might want to book a call or see pricing. One clear action works better than several competing ones.",
  ),

  h2("Step 5: Distribute more than you create"),
  p(
    "Most content is under-distributed. Publishing once and moving on wastes the effort that went into it. Plan distribution as part of the brief:",
  ),
  ul(
    "Turn one core piece into several formats: a long article, a short video, a carousel, an email.",
    "Share it again when it becomes relevant to a new conversation or season.",
    "Give it to your sales team so they can send it in reply to common questions.",
    "Link related pieces together so readers can keep going.",
  ),

  h2("Step 6: Measure what matters"),
  p("Views and likes are signals, not outcomes. Alongside them, track:"),
  ul(
    "Enquiries and sign-ups that came from or mention a piece of content.",
    "Which pieces people read before getting in touch.",
    "Questions that disappear from sales calls because content answered them.",
  ),
  p("Review these monthly and do more of what moves people forward, even if it is less popular than what gets the most views."),

  hr,
  h2("A one-page content plan"),
  ol(
    "List the ten questions your audience asks most before buying.",
    "Map each one to a stage: discover, consider or decide.",
    "Choose one core format per question and plan two or three repurposed versions.",
    "Write one clear next step for each piece.",
    "Schedule distribution, not just publishing.",
  ),
  p("Content that converts is not a trick. It is useful answers, delivered consistently, with a clear path to the next step."),
);
