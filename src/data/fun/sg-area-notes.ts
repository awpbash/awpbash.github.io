// Jev's choice criteria for the Singapore map, one entry per URA planning area.
// Two lines each, same shape everywhere:
//   Facts: what kind of area it is, its neighbourhoods, and its main places.
//   Known for: the candid local take, jokes and stereotypes included.
// Landmark placement was checked against the planning area boundaries in sg-areas.json.
const note = (facts: string, knownFor: string) => `Facts: ${facts}\nKnown for: ${knownFor}`;

export const AREA_NOTES: Record<string, string> = {
  AM: note(
    "Mature HDB town in the north-central region with Ang Mo Kio Town Centre, Cheng San, Kebun Bahru, Townsville, Yio Chu Kang and Seletar Hills, plus AMK Hub and Ang Mo Kio Town Garden.",
    "The uncle and auntie heartland. Solid, old-school, full of kopitiams and cheap food. Comfortable and a bit boring.",
  ),
  BD: note(
    "Large eastern town of HDB estates and landed homes covering Bedok North, Bedok South, Bedok Reservoir, Kembangan, Siglap, Frankel and Bayshore, with Bedok Mall, Bedok Reservoir Park and part of East Coast Park.",
    "Peak east-side pride. Easties swear their food is better, and Bedok 85 bak chor mee and Simpang Bedok supper back them up. Also the land of weekend cyclists heading to East Coast.",
  ),
  BS: note(
    "Central HDB town with condominiums and landed pockets, covering Bishan East, Bishan North, Marymount and Sin Ming, with Junction 8, Bishan-Ang Mo Kio Park and Raffles Institution.",
    "Kiasu parent heaven. Top schools like Raffles, tuition everywhere, and the otter family in Bishan-AMK Park that is more famous than most celebrities.",
  ),
  BK: note(
    "Western HDB town covering Bukit Batok Central, Bukit Batok West, Guilin and Hong Kah North, with Bukit Batok Nature Park, Little Guilin quarry, Bukit Gombak and West Mall.",
    "Quiet western heartland most people only know for Little Guilin's Instagram quarry. Otherwise sleepy, hilly and a bit forgettable.",
  ),
  BL: note(
    "Industrial area in the far west of factories, shipyards and industrial estates with almost no homes. The Boon Lay housing estate and Jurong Point mall sit next door in Jurong West.",
    "Factories and shipyards. If you are here and not working, you are probably lost on the way to Jurong Point.",
  ),
  BM: note(
    "Central-south area covering Tiong Bahru, Redhill, Alexandra, Henderson, Telok Blangah, Everton Park and HarbourFront, with Tiong Bahru Market, ABC Brickworks food centre, Mount Faber, Henderson Waves, Labrador Nature Reserve, VivoCity and Singapore General Hospital.",
    "Tiong Bahru hipster central, overpriced coffee in art deco flats, bakeries with queues, plus the Southern Ridges for people who want a hike that ends at VivoCity.",
  ),
  BP: note(
    "North-western HDB town on its own LRT loop, covering Bangkit, Fajar, Jelapang, Saujana, Senja, Hillview and Dairy Farm, with Bukit Timah Nature Reserve, Dairy Farm Nature Park and Hillion Mall.",
    "Home of the LRT that breaks down, a leafy far-west suburb people call ulu, and the starting point for pretending Bukit Timah Hill is a real mountain.",
  ),
  BT: note(
    "Central-west area of landed houses, condominiums and schools covering Sixth Avenue, Coronation Road, Swiss Club, Hillcrest and Beauty World, with Beauty World food centre, the Rail Corridor, Ngee Ann Polytechnic and the SUSS campus.",
    "Rich kid central. Big landed houses, elite schools, tuition centres and luxury cars. If you say you live in Bukit Timah, people assume your parents are loaded.",
  ),
  CB: note(
    "Reclaimed land east of Changi Airport reserved for future airport expansion, with no homes and no public attractions.",
    "Literally empty reclaimed land waiting for Terminal 5. Nothing here.",
  ),
  CC: note(
    "Central nature reserve around MacRitchie, Upper Peirce, Lower Peirce and Upper Seletar reservoirs, with no homes. The Mandai wildlife parks, including Singapore Zoo, Night Safari, River Wonders and Bird Paradise, sit on its northern edge.",
    "Where Singaporeans go to touch grass. MacRitchie runners, monkeys stealing your snacks, quiet trails for a good cry, and the zoo on the edge for family outings.",
  ),
  CH: note(
    "Far eastern area dominated by Changi Airport and Jewel, plus Changi Village, Changi Point, Changi Beach Park, the Pulau Ubin ferry terminal and the Changi Chapel and Museum.",
    "The best airport in the world and Jewel's waterfall, and Changi Village nasi lemak after a night out. Feels like a seaside kampung holiday at the end of the island.",
  ),
  CK: note(
    "North-western HDB town with an LRT line, covering Choa Chu Kang Central, Keat Hong, Teck Whye, Yew Tee and Peng Siang, with Lot One, Yew Tee Point and Choa Chu Kang Park.",
    "Far, far west. People think of it as ulu, cheap and a long MRT ride from anywhere, with cemeteries nearby adding to the spooky reputation.",
  ),
  CL: note(
    "Western HDB town covering Clementi Central, Clementi West, Clementi Woods, Sunset Way, Pandan and Toh Tuck, with Clementi Mall, Clementi Woods Park and several food centres and markets.",
    "Student town for NUS and poly kids, cheap good food, and a comfy, slightly boring west-side neighbourhood.",
  ),
  DT: note(
    "Singapore's central business district and waterfront covering Raffles Place, Marina Bay, City Hall, Bugis, Tanjong Pagar, Telok Ayer and Cecil Street, with Marina Bay Sands, the Esplanade, Merlion Park, Lau Pa Sat, Maxwell and Amoy Street food centres, Raffles Hotel, CHIJMES, Suntec City and the National Library.",
    "Corporate Singapore. Office workers in lanyards, overpriced lunches, famous hawker centres at noon, and rooftop bars where bankers flex after work. Dead on weekends except for tourists at Marina Bay Sands.",
  ),
  GL: note(
    "East-central area of shophouses and HDB estates covering Geylang Road, Aljunied, Kampong Ubi, MacPherson, Geylang Serai, Paya Lebar and the northern part of Joo Chiat, with Geylang Serai Market, Paya Lebar Quarter and the Koon Seng Road shophouses.",
    "Singapore's red-light district and supper capital in one. Durian at 2am, frog porridge, zi char, dodgy lorongs, but also Geylang Serai's Malay heritage and pretty Joo Chiat shophouses. Your parents told you not to go there at night.",
  ),
  HG: note(
    "North-eastern HDB town with landed pockets, covering Hougang Central, Kovan, Lorong Ah Soo, Upper Paya Lebar and Defu, with Hougang Mall, Kovan food centre and Punggol Park.",
    "Teochew heartland full of aunties and good cheap food. Down-to-earth, a bit ulu, and nobody from outside ever goes there on purpose.",
  ),
  JE: note(
    "Western regional centre covering Jurong Gateway, Toh Guan, Teban Gardens, Yuhua and International Business Park, with Westgate, JEM and IMM malls, the Science Centre, Jurong Lake Gardens and Ng Teng Fong General Hospital.",
    "The west's answer to town. Malls stacked on malls, the Science Centre school trip, and Jurong Lake Gardens for families. Westies call it the second CBD with a straight face.",
  ),
  JW: note(
    "Large far-western HDB town covering Boon Lay Place, Hong Kah, Taman Jurong, Yunnan, Wenya and Jurong West Central, with Jurong Point mall, Jurong Central Park and Jurong West Stadium.",
    "So far west people joke you need a passport. Huge, sleepy HDB sprawl with good neighbourhood food and a long ride to anything.",
  ),
  KL: note(
    "Central-east area around the Kallang River covering Lavender, Bendemeer, Boon Keng, Kallang Bahru, Jalan Besar and Tanjong Rhu, with the National Stadium, Sports Hub, Kallang Wave Mall, the Indoor Stadium and Mustafa Centre.",
    "Concerts and football at the Sports Hub, 24-hour shopping at Mustafa, and Jalan Besar hipster cafes between old hardware stores.",
  ),
  LK: note(
    "Rural north-western area of farms, wetlands and cemeteries covering the Kranji countryside and Lim Chu Kang Road, with Sungei Buloh Wetland Reserve and Kranji Marshes, and almost no homes.",
    "Singapore's closest thing to the countryside. Farms, goats, crocodiles at Sungei Buloh, cemeteries, and a vibe of being lost in Malaysia.",
  ),
  MD: note(
    "North-central area of forest, reservoirs and a few industrial and residential pockets around Mandai Road, including Sembawang Hot Spring Park.",
    "The zoo road and forest. Night Safari dates, monkeys, and the hot spring where uncles soak their feet.",
  ),
  ME: note(
    "Reclaimed land on the eastern side of Marina Bay with no homes, home to Gardens by the Bay East.",
    "Empty grass with the best skyline view. Kite flyers, picnickers and couples watching the sunset.",
  ),
  MP: note(
    "South-eastern coastal area of HDB flats, condominiums and landed homes covering Katong, Marine Parade, Mountbatten and East Coast, with Parkway Parade, i12 Katong, Marine Parade food centre and the western end of East Coast Park.",
    "Katong laksa, Peranakan aunties and old-school east-side charm. Everyone's grandparents live in Marine Parade, and East Coast Park barbecues are a rite of passage.",
  ),
  MS: note(
    "Waterfront area south of Marina Bay covering Gardens by the Bay's Bay South Garden, Marina Barrage and Marina South Pier, with few homes.",
    "Tourist central for the Supertrees light show and the Flower Dome, and couples picnicking on the Marina Barrage roof.",
  ),
  MU: note(
    "Central arts, heritage and education district covering Bras Basah, Dhoby Ghaut and Fort Canning, with the National Museum, Peranakan Museum, Singapore Art Museum, Fort Canning Park, SMU, Bras Basah Complex and Plaza Singapura.",
    "Museums, SMU students and arty kids. Fort Canning for photoshoots, concerts and wedding pictures.",
  ),
  NE: note(
    "Offshore islands in the north-east, mainly Pulau Ubin with its few kampung houses and trails, and Pulau Tekong, a military island closed to the public.",
    "Pulau Ubin is Singapore pretending it is still 1960, bumboats, bicycles and kampung houses. Pulau Tekong is where every 18-year-old guy suffers through army basic training.",
  ),
  NT: note(
    "Small central area of condominiums, private housing and schools next to Orchard Road, covering Newton Circus and Cairnhill, with Newton Food Centre and the Newton MRT interchange.",
    "Newton Food Centre, the tourist-trap hawker centre from Crazy Rich Asians where uncles upsell you chilli crab.",
  ),
  NV: note(
    "Central area of hospitals, offices, condominiums and older shophouse streets covering Novena, Balestier, Whampoa, Moulmein and Thomson, with Tan Tock Seng Hospital, Adam Road Food Centre, Whampoa market and Velocity and Square 2 malls.",
    "Hospital land. Tan Tock Seng and medical centres everywhere, plus Balestier chicken rice and bak kut teh and Adam Road nasi lemak.",
  ),
  OR: note(
    "Central shopping and hotel district along Orchard Road covering Orchard, Somerset and the Tanglin Road end, with ION Orchard, Ngee Ann City, Paragon, 313@Somerset, Tanglin Mall and the Emerald Hill shophouses.",
    "Shopping central, packed with teenagers loitering, tourists, luxury brands and bubble tea queues. Orchard is where you go when you cannot think of anywhere else.",
  ),
  OT: note(
    "Chinatown and its surroundings covering Chinatown, Pearl's Hill, People's Park, Duxton Hill and Keong Saik, with Chinatown Complex food centre, the Buddha Tooth Relic Temple, Pagoda Street, People's Park Complex and the Pinnacle@Duxton skybridge.",
    "Chinatown's street food, souvenirs and Chinese New Year crowds, plus hip bars on Keong Saik and Duxton Hill for the cool crowd.",
  ),
  PG: note(
    "Newer far north-eastern HDB town with an LRT line, covering Punggol Town Centre, Matilda, Waterway East, Northshore and Punggol Digital District, with Punggol Waterway Park, Coney Island, Punggol Point, Waterway Point and the SIT campus.",
    "The middle of nowhere at the edge of the island. Young couples with new BTO flats, strollers everywhere, and Coney Island for a wild beach.",
  ),
  PL: note(
    "East-central area taken up mainly by Paya Lebar Air Base and the Airport Road industrial area, with almost no homes. Paya Lebar Quarter and Geylang Serai sit next door in Geylang.",
    "Fighter jets screaming overhead and a giant airbase. Nobody goes here.",
  ),
  PN: note(
    "Industrial area in the far west covering the Pioneer and Joo Koon industrial estates, with factories and logistics and almost no homes.",
    "Factories and warehouses. Nobody goes here unless they work here.",
  ),
  PR: note(
    "North-eastern coastal HDB town with holiday chalets, covering Pasir Ris Central, Elias, Loyang and Flora Drive, with Pasir Ris Park, Downtown East, Wild Wild Wet and White Sands mall.",
    "Chalet parties, beach barbecues and army boys waiting for the ferry to Tekong. Relaxed, a bit ulu, very east-side.",
  ),
  QT: note(
    "South-western area and Singapore's first satellite town, covering Queenstown, Commonwealth, Tanglin Halt, Holland Village, Buona Vista, one-north, Dover, Kent Ridge and Pasir Panjang, with NUS, Fusionopolis, Biopolis, Kent Ridge Park, West Coast Park and Alexandra Hospital.",
    "Holland V's expat bars and ang moh brunch crowd, NUS students, tech bros at one-north, and old Queenstown HDB heritage.",
  ),
  RC: note(
    "Central heritage area of shophouses, mosques, temples and markets covering Little India, Kampong Glam, Bugis Street and Arab Street, with Tekka Centre, Sultan Mosque, Haji Lane and LASALLE College of the Arts.",
    "Little India's curry and Deepavali lights, Kampong Glam's hookah bars and Haji Lane's hipster street art and cocktail spots. Crowded, colourful and loud on weekends.",
  ),
  RV: note(
    "Central residential area of condominiums and serviced apartments along the upper Singapore River, covering River Valley, Institution Hill and Oxley.",
    "Expensive condos and expats, quiet streets and brunch spots. You only live here if you are rich or your company pays your rent.",
  ),
  SB: note(
    "Far-northern HDB town with older landed and colonial housing, covering Sembawang Central, Admiralty, Canberra, Wellington and Sembawang Hills, with Sembawang Park, Sembawang Shopping Centre and Canberra Plaza.",
    "End of the line up north. Old naval base houses, one of the last natural beaches, and a sleepy, faraway vibe.",
  ),
  SE: note(
    "North-eastern HDB town with an LRT line, covering Sengkang Town Centre, Anchorvale, Compassvale, Fernvale and Rivervale, with Sengkang Riverside Park, Compass One and Sengkang General Hospital.",
    "Baby town. Strollers, young families, new flats and people who never leave the estate on weekends.",
  ),
  SG: note(
    "North-eastern area of HDB flats, condominiums and landed homes covering Serangoon Central, Serangoon Gardens, Lorong Chuan and Upper Paya Lebar, with NEX mall and Chomp Chomp food centre.",
    "Chomp Chomp supper, Serangoon Gardens cafes, comfortable middle-class families, and NEX where the whole northeast goes to shop.",
  ),
  SI: note(
    "Sentosa and the smaller southern islands, including St John's, Lazarus and Kusu, with Universal Studios Singapore, Resorts World Sentosa, the S.E.A. Aquarium and Siloso, Palawan and Tanjong beaches.",
    "Sentosa, Singapore's overpriced playground. Beach clubs, Universal Studios, resort staycations, and tourists paying to cross a bridge.",
  ),
  SK: note(
    "North-western industrial area of factories and timber and furniture businesses covering the Sungei Kadut industrial estate and Kranji, with Kranji War Memorial and almost no homes.",
    "Timber yards and furniture factories, plus the solemn Kranji War Memorial.",
  ),
  SL: note(
    "North-eastern area centred on Seletar Airport and Seletar Aerospace Park, with a heritage estate of black-and-white colonial houses.",
    "Hidden colonial black-and-white houses turned into cafes. Feels like a secret, quiet, a bit bougie.",
  ),
  SM: note(
    "Undeveloped land on the northern coast with no homes and no attractions, set aside for future development.",
    "Empty land. Nothing to do.",
  ),
  SR: note(
    "Central riverside area of restaurants, bars, hotels and condominiums covering Clarke Quay, Boat Quay and Robertson Quay, with Great World mall.",
    "Clarke Quay clubbing, drunk expats on Boat Quay and overpriced riverside drinks. Where your night out begins and your wallet ends.",
  ),
  SV: note(
    "Small reclaimed waterfront next to Marina Bay, mostly offices and future development, with few homes.",
    "Offices and construction. Nobody goes here.",
  ),
  TH: note(
    "Newest HDB town in the west, still being built, with the Plantation, Garden, Park and Brickland districts.",
    "Brand new forest town still under construction. Mostly empty, young couples, and the joke is you live in a jungle.",
  ),
  TM: note(
    "Large eastern HDB town and regional centre covering Tampines Central, Tampines East, Tampines West, Tampines North and Simei, with Tampines Mall, Tampines 1, Century Square, Our Tampines Hub, IKEA Tampines and Tampines Eco Green.",
    "Tampines thinks it is its own country. Three malls, IKEA, Our Tampines Hub, a proud east-side identity, and you never need to leave.",
  ),
  TN: note(
    "Central area of embassies, landed houses and condominiums covering Tanglin, Holland Road, Nassim, Chatsworth, Dempsey and Tyersall, with the Singapore Botanic Gardens and Dempsey Hill.",
    "Old money and embassies. Botanic Gardens picnics, Dempsey's expensive brunch and bars, and tai tais in designer gym wear.",
  ),
  TP: note(
    "Central mature HDB town covering Toa Payoh Central, Braddell, Boon Teck, Kim Keat and Lorong 8, with Toa Payoh Hub, Lorong 8 market and food centre and Toa Payoh Town Park.",
    "Old-school heartland, the famous dragon playground, and some of the best cheap hawker food. Everyone's childhood memories.",
  ),
  TS: note(
    "Industrial area and port at the far western tip covering Tuas industrial estate, Tuas Port and the Second Link, with no homes.",
    "Factories, the port and the jam at Tuas Checkpoint to JB. So far west it barely feels like Singapore.",
  ),
  WC: note(
    "Large western area of reservoirs, forest and military training grounds, mostly closed to the public, including Tengeh, Poyan and Murai reservoirs. NTU's campus sits on its eastern edge.",
    "Army training ground where national servicemen suffer in the jungle, plus NTU students stuck on a campus far from everything.",
  ),
  WD: note(
    "Northern HDB town and regional centre on the border with Malaysia, covering Woodlands Central, Marsiling, Admiralty and Woodlands North, with Causeway Point, Woodlands Waterfront Park, Admiralty Park and the Woodlands Checkpoint.",
    "The gateway to JB. Causeway jams, cheap petrol and groceries across the border, and a northern town that feels closer to Malaysia than to town.",
  ),
  WI: note(
    "Offshore islands in the south-west, mainly Jurong Island, a petrochemical industrial hub closed to the public, with no homes.",
    "Jurong Island's refineries and flares. Closed off, industrial, nothing for the public.",
  ),
  YS: note(
    "Northern HDB town covering Yishun Central, Khatib, Lower Seletar, Nee Soon and Yishun East, with Northpoint City, Lower Seletar Reservoir Park, Yishun Pond Park and Khoo Teck Puat Hospital.",
    "Singapore's weirdest town. Jokingly called the ghetto of Singapore, the butt of endless 'only in Yishun' memes about bizarre incidents, cat killings and strange neighbours. Also an affordable heartland with a big mall.",
  ),
};
