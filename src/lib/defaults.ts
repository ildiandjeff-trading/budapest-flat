import { addDays, format } from "date-fns";
import type { GuideSection, Stay } from "./types";

export const DEFAULT_GUIDE: Omit<GuideSection, "id">[] = [
  { position: 0, icon: "key", title: "Arrival & keys", body: "Welcome to Budapest!\n- The address is [street, number, floor, door].\n- Keys are in the key box by the front door. The code will be sent to you before arrival.\n- Press the buzzer marked [name] if you need to be let in." },
  { position: 1, icon: "wifi", title: "Wi-Fi", body: "- Network: [network name]\n- Password: [password]\nThe router is in the living room if you need to restart it." },
  { position: 2, icon: "flame", title: "Heating & hot water", body: "- Thermostat is in the hallway. Please keep it around 21°C.\n- The boiler is in the bathroom. If the hot water stops, press the reset button on the front." },
  { position: 3, icon: "utensils", title: "Kitchen & appliances", body: "- Help yourself to tea, coffee and spices.\n- The dishwasher tablets are under the sink.\n- Washing machine: use the 40° quick programme." },
  { position: 4, icon: "trash", title: "Rubbish & recycling", body: "- Bins are in the courtyard.\n- Yellow lid: plastic & metal. Blue lid: paper. Grey: everything else.\n- Glass goes to the street containers on the corner." },
  { position: 5, icon: "tram", title: "Getting around", body: "- From the airport take the 100E bus into the city, or a Bolt/Főtaxi.\n- Trams and metro are easiest with the BudapestGO app.\n- The nearest tram stop is [stop name]." },
  { position: 6, icon: "heart", title: "Our local favourites", body: "- Coffee: [café]\n- Dinner: [restaurant]\n- Baths: Széchenyi or Gellért, go early on weekdays.\n- Market: the Great Market Hall at Fővám tér." },
  { position: 7, icon: "phone", title: "Emergencies & house rules", body: "- Emergency number: 112\n- Our phone: [number]\n- Neighbour who can help: [name, flat number]\n- Quiet hours are 10pm to 7am. No smoking inside, please.\n- Before you leave: strip the beds, run the dishwasher and put the keys back in the box." },
];

const d = (n: number) => format(addDays(new Date(), n), "yyyy-MM-dd");

export const DEMO_STAYS: Stay[] = [
  { id: "demo1", guest_name: "Anna & Peter", start_date: d(-3), end_date: d(4), guests: 2, color: "#2b6cb0", notes: "Arriving on the evening flight." },
  { id: "demo2", guest_name: "Cousin Marta", start_date: d(6), end_date: d(13), guests: 1, color: "#c8553d", notes: null },
  { id: "demo3", guest_name: "The Kovács family", start_date: d(18), end_date: d(30), guests: 4, color: "#2f855a", notes: "Need the travel cot." },
  { id: "demo4", guest_name: "Sam", start_date: d(36), end_date: d(40), guests: 1, color: "#805ad5", notes: null },
];
