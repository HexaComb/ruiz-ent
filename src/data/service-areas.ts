// Coverage is the six-city list in the client-supplied Google Business Profile
// screenshot, confirmed November 9, 2026. It is a service-area business, not a
// network of storefronts. Do not add addresses, postal codes or local job claims.
export const serviceAreas = [
  {
    slug: 'kingsburg', name: 'Kingsburg',
    title: 'Concrete Contractor in Kingsburg, CA | Ruiz Family Enterprises',
    description: 'Plan concrete patios, driveways, block walls and masonry in Kingsburg, CA with Ruiz Family Enterprises. Call our family team for a free on-site estimate.',
    summary: 'Our home base for general engineering, concrete and masonry projects.',
    intro: 'Our family team is based in Kingsburg, serving homeowners and businesses with general engineering, concrete and masonry work. From a new patio to a block wall or commercial concrete scope, we start with your property, your plans and how the finished space needs to work.',
    planningTitle: 'Plan the whole space, not just the pour',
    planning: 'For a Kingsburg patio, driveway or walkway, a useful starting point is a sketch of the area and its connections to doors, gates, existing concrete and landscaping. Show us where water collects, what needs to be removed and how equipment can reach the work. Those details help us discuss preparation and the finished layout together.',
    checklist: ['Approximate dimensions and photos of the existing surface', 'Gate widths, access routes and areas you need to keep usable', 'Your preferred finish and any adjoining wall or stonework'],
    resource: { title: 'City of Kingsburg Building Department', url: 'https://www.cityofkingsburg-ca.gov/149/Building-Department', text: 'Kingsburg provides building applications, residential and commercial submittal checklists, and inspection information. Its permit lookup covers permits started in January 2024 or later. For an older property record or a new scope, check with the department rather than assuming an online search is the full history.' },
    questions: [
      { question: 'Can I discuss a patio and masonry together?', answer: 'Yes. Describe the concrete surface and any block wall, retaining wall, decorative stone or brick work in the same inquiry. Include how the pieces connect so we can discuss the combined scope.' },
      { question: 'Where do we meet about a Kingsburg project?', answer: 'Call our family team to discuss a free on-site estimate at your project location. We provide services at customer properties and do not list a public walk-in office.' }
    ]
  },
  {
    slug: 'fresno', name: 'Fresno',
    title: 'Fresno Concrete & Masonry | Ruiz Family Enterprises',
    description: 'Concrete flatwork, patios, driveways and masonry services in Fresno, CA. Discuss residential or commercial work with Ruiz Family Enterprises.',
    summary: 'Concrete and masonry for residential, commercial and site-improvement scopes.',
    intro: 'Ruiz Family Enterprises serves Fresno with concrete flatwork, masonry and general engineering services. Whether the project is at a home or an operating business, tell us what you are building and which parts of the property need to stay accessible during the work.',
    planningTitle: 'Separate the work area from the access you need',
    planning: 'A driveway replacement, commercial concrete pad or walkway can affect more than the surface being built. Mark vehicle entrances, pedestrian routes and delivery access on your plan. If a scope reaches a public sidewalk or curb, identify that boundary early so the appropriate city requirements can be checked before scheduling.',
    checklist: ['Plans or a sketch showing the concrete or masonry work limits', 'Business access, deliveries or parking that must be coordinated', 'Existing surfaces to remove and the desired finish or materials'],
    resource: { title: 'City of Fresno Building and Safety', url: 'https://www.fresno.gov/planning/building-and-safety/', text: 'Fresno provides building forms, permit and application status through Accela, and inspection resources. City of Fresno and Fresno County use separate building departments. A Fresno mailing address alone does not establish which one handles the property, so confirm jurisdiction before choosing a permit process.' },
    questions: [
      { question: 'Do you discuss commercial concrete work in Fresno?', answer: 'Yes. Our published services include commercial flatwork and concrete equipment pads alongside residential concrete and masonry. Send the plans, intended use and access constraints so we can review the scope.' },
      { question: 'What if the work is beside a public sidewalk?', answer: 'Include photos showing the property edge, sidewalk and curb. Ask the appropriate department which approvals apply to that exact work; a private-property improvement and work in a public area may follow different processes.' }
    ]
  },
  {
    slug: 'madera', name: 'Madera',
    title: 'Madera Concrete & Masonry | Ruiz Family Enterprises',
    description: 'Discuss concrete driveways, patios, walls and stonework in Madera, CA with Ruiz Family Enterprises. Start with your project location and scope.',
    summary: 'Start with your property location, access and concrete or masonry plans.',
    intro: 'Planning concrete or masonry work in Madera? Ruiz Family Enterprises offers patios, driveways, sidewalks, block and retaining walls, and stone or brick work as part of our Central Valley service area. Share the project address and the work you have in mind so we can discuss the fit.',
    planningTitle: 'Confirm the property, then define the scope',
    planning: 'For a Madera project, keep the street address and parcel information with your photos or drawings. Show the route from the street to the work area, any surface that needs removal, and where new concrete or masonry will meet existing improvements. This gives the first conversation more substance than a square-footage estimate alone.',
    checklist: ['Project address and parcel information, if available', 'Work-area dimensions plus photos of access and adjoining surfaces', 'Existing drainage concerns and the intended use of the finished area'],
    resource: { title: 'City of Madera Building Division', url: 'https://www.madera.gov/business-building-development/building-divison/', text: 'The City of Madera Building Division covers permitting, plan review, inspections and construction records for properties inside city limits. Its guidance distinguishes city properties from locations handled by Madera County outside city limits. Confirm the parcel jurisdiction before using city forms or requesting records.' },
    questions: [
      { question: 'Can you discuss removing existing concrete?', answer: 'Yes. Concrete removal is among our published services. Share photos of the existing surface and the replacement you want so removal, access and new work can be considered together.' },
      { question: 'Does a Madera address always mean a City of Madera permit?', answer: 'No. The city distinguishes properties inside its limits from properties under county jurisdiction. Confirm which department handles the parcel and ask that department about the proposed work.' }
    ]
  },
  {
    slug: 'visalia', name: 'Visalia',
    title: 'Visalia Concrete & Masonry | Ruiz Family Enterprises',
    description: 'Plan a patio, pool deck, driveway or masonry project in Visalia, CA. Ruiz Family Enterprises offers concrete and masonry with free on-site estimates.',
    summary: 'Bring your outdoor layout, finish ideas and project documents together.',
    intro: 'Ruiz Family Enterprises serves Visalia property owners with concrete and masonry specialties, including patios, porches, pool decks, driveways and walls. Our family team also discusses commercial, industrial and custom scopes. Start with what the area needs to do and the finish you want to see.',
    planningTitle: 'Connect the finish to the way you use the space',
    planning: 'When planning a patio or pool deck, show where people walk, where furniture will sit and how the new surface connects to doors, steps and existing paving. Reference photos can help explain a stamped-concrete or masonry finish, but dimensions, drainage and access are also needed to discuss a site-specific estimate.',
    checklist: ['A layout of the proposed surface and nearby doors, steps or pool edges', 'Finish reference photos and approximate project dimensions', 'Any existing plans, review comments or documents for the same scope'],
    resource: { title: 'City of Visalia Permit Counter', url: 'https://www.visalia.gov/224/Permit-Counter', text: 'Visalia’s Permit Counter explains plan-submission options and links to the city’s Accela resources for application status and corrections. Use the current submission instructions when assembling documents, and keep review comments with the latest version of your plans so everyone is discussing the same scope.' },
    questions: [
      { question: 'Can I ask about stamped concrete for a Visalia patio?', answer: 'Yes. Stamped concrete, patios, porches and pool decks are part of our concrete service list. Bring finish references and explain how you use the area so we can discuss the project rather than just a pattern.' },
      { question: 'What should I send if I already have plans?', answer: 'Share the latest drawings, the project location and any review comments that affect the concrete or masonry scope. Tell us which parts of the work you want included in the estimate.' }
    ]
  },
  {
    slug: 'fowler', name: 'Fowler',
    title: 'Fowler Concrete & Masonry | Ruiz Family Enterprises',
    description: 'Concrete patios, driveways, block walls and stonework for Fowler, CA projects. Talk with Ruiz Family Enterprises about your plans and an on-site estimate.',
    summary: 'Coordinate exterior concrete, masonry and site details before work begins.',
    intro: 'Fowler is part of Ruiz Family Enterprises’ service area for general engineering, concrete and masonry. Contact our family team about a new patio, driveway, walkway, block wall or stonework, and tell us how the proposed work fits with the rest of your property.',
    planningTitle: 'Make the connections clear',
    planning: 'For exterior work in Fowler, a simple site sketch can show more than separate measurements. Mark the concrete edges, gates, walls and any drains near the proposed work. If the project includes drain or gutter work, describe the issue and show the existing route rather than assuming a surface replacement will resolve it.',
    checklist: ['A sketch of proposed concrete or masonry and nearby property features', 'Photos of existing drains, gutters and any areas that collect water', 'The project address, parcel number if known, and access limitations'],
    resource: { title: 'City of Fowler building permit application (PDF)', url: 'https://www.fowlercity.org/media/236', text: 'Fowler’s official application identifies the project address, parcel number, work description and owner or contractor details needed to describe a proposal. It also identifies a separate sanitation-district contact for sewer-improvement questions. Use it to prepare your information, then confirm the current submission process and any project-specific requirements with the city.' },
    questions: [
      { question: 'Can drain and gutter work be part of my inquiry?', answer: 'Yes. These are published Ruiz services. Include the problem you are trying to solve, photos and any available plans. The appropriate approach depends on the actual site and proposed scope.' },
      { question: 'Can you discuss a block wall alongside a driveway?', answer: 'Yes. Give us the dimensions and layout for both, including gates and where the driveway meets the wall. Share property-boundary information if you have it, and confirm any applicable requirements before work begins.' }
    ]
  },
  {
    slug: 'hanford', name: 'Hanford',
    title: 'Hanford Concrete & Masonry | Ruiz Family Enterprises',
    description: 'Discuss concrete replacement, patios, driveways and masonry in Hanford, CA. Ruiz Family Enterprises helps you plan a site-specific project estimate.',
    summary: 'Plan concrete replacements and masonry additions around existing improvements.',
    intro: 'Ruiz Family Enterprises serves Hanford with concrete and masonry work for homes, businesses and custom projects. From a replacement concrete surface to new block, stone or brick work, we want to understand what stays, what changes and how you will use the completed area.',
    planningTitle: 'Show what stays and what needs to change',
    planning: 'For a Hanford improvement project, photograph the full work area as well as any damaged surface or detail you want changed. Mark existing concrete, walls and landscaping that should remain. Separate removal, new construction and finish preferences in your project notes so the estimate conversation covers each part of the job.',
    checklist: ['Photos identifying existing improvements to keep or remove', 'Dimensions for new flatwork, walls, steps or decorative masonry', 'Plans or property records relevant to the proposed changes'],
    resource: { title: 'City of Hanford Building Division', url: 'https://www.hanfordca.gov/168/Building', text: 'Hanford’s Building Division provides plan-review, building-permit and inspection information for construction inside city limits, with online resources through its Citizen Self-Service Portal. Confirm the property’s jurisdiction first, then check the city’s current instructions for your application or inspection rather than relying on an old schedule.' },
    questions: [
      { question: 'Can an estimate include removal and replacement?', answer: 'Yes. Concrete removal and new concrete work are both on our service list. Identify the surface to remove, what should remain and the new layout so the estimate can address the full requested scope.' },
      { question: 'Do you offer decorative stone or brick work in Hanford?', answer: 'Yes. Our masonry specialties include decorative and architectural stone, brick work, block walls and retaining walls. Share reference photos and the location of the proposed masonry to start the discussion.' }
    ]
  }
] as const;

export type ServiceArea = (typeof serviceAreas)[number];
export const serviceAreaNames = serviceAreas.map(area => area.name).join(', ');
export const serviceAreaPath = (slug: string) => `/service-areas/${slug}/`;
