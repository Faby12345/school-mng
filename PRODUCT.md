# Școala Mea — Product Requirements Document

## 1. Rezumat

**Școala Mea** este o aplicație web full-stack, optimizată pentru iPhone și instalabilă ca Progressive Web App (PWA). Este creată pentru o singură elevă de clasa a VIII-a și reunește temele, notele, mediile, notițele și flashcardurile într-o experiență simplă, cu aspect apropiat de aplicațiile Apple.

Aplicația nu va fi publicată în App Store. Se accesează prima dată printr-un link privat, apoi din Safari se folosește **Share → Add to Home Screen**. După instalare apare pe ecranul principal cu pictogramă proprie și se deschide fără bara obișnuită a browserului.

> Pictograma PWA nu este un widget iOS propriu-zis. Un widget care afișează informații direct pe Home Screen ar necesita ulterior o extensie nativă realizată cu WidgetKit.

## 2. Obiective

- să fie instalată pe iPhone fără App Store;
- să funcționeze ca o aplicație mobilă, nu ca un site desktop micșorat;
- să permită introducerea și urmărirea temelor și notelor;
- să calculeze automat mediile și să simuleze note viitoare;
- să transforme notițele în întrebări și flashcarduri;
- să păstreze datele în siguranță într-un cont privat;
- să ofere actualizări imediat după un nou deploy, fără reinstalare;
- să ofere Light Mode, Dark Mode și tema sistemului.

## 3. Utilizator

Există un singur utilizator principal: sora proprietarului aplicației. Nu există roluri pentru profesori, părinți sau administratori în produs.

Înregistrarea publică este dezactivată după crearea contului ei. Orice pagină cu date școlare necesită autentificare.

## 4. Principii de produs

1. **Mobile first:** toate fluxurile sunt proiectate întâi pentru ecranul unui iPhone.
2. **Rapid:** o temă sau o notă se adaugă în câteva secunde.
3. **Calm:** interfața informează fără să creeze presiune inutilă.
4. **Privat:** datele nu sunt accesibile doar pentru că cineva cunoaște URL-ul.
5. **Confirmabil:** întrebările generate sunt propuneri editabile, nu adevăruri salvate automat.
6. **Progresiv:** funcțiile de bază rămân disponibile chiar dacă notificările sau AI-ul nu sunt disponibile.

## 5. Navigare

Bara principală este fixată jos și are patru secțiuni:

### Acasă

- data și un salut scurt;
- progresul temelor din ziua curentă;
- următoarea temă și următorul test;
- butoane rapide pentru notă, temă și lecție;
- materii care necesită atenție;
- numărul flashcardurilor programate pentru recapitulare.

### Catalog

- lista materiilor și media fiecăreia;
- detalii pentru fiecare materie;
- adăugare, editare și ștergere note;
- valoare 1–10, dată, tip de evaluare și observație opțională;
- media aritmetică afișată cu două zecimale;
- simulator „Ce medie aș avea dacă iau nota X?”.

Catalogul este personal și orientativ. Nu reprezintă catalogul oficial al școlii.

### Învață

- spațiu de lucru separat pentru fiecare materie;
- capitole grupate în fiecare materie (de exemplu Funcții sau Derivate);
- notițe tip flashcard create, editate și șterse în fiecare capitol;
- navigare Materie → Capitol → Notițe, optimizată pentru telefon;
- generarea unor întrebări din notițe;
- verificarea, editarea și eliminarea propunerilor înainte de salvare;
- sesiune de studiu cu răspuns ascuns;
- evaluare prin „Mai repet”, „Aproape” și „Știu”.

### Teme

- listele „Astăzi”, „Urmează” și „Finalizate”;
- titlu, materie, termen-limită, prioritate și detalii;
- marcare rapidă drept finalizată;
- filtre după materie și stare;
- reminder în aplicație;
- notificări push opționale într-o etapă ulterioară.

Setările sunt accesibile din avatarul aflat în colțul ecranului Acasă.

## 6. Materii

La prima utilizare sunt propuse materiile uzuale:

- Limba și literatura română;
- Matematică;
- Limba engleză;
- Istorie;
- Geografie;
- Biologie;
- Fizică;
- Chimie;
- Informatică;
- Educație socială.

Lista este editabilă. Fiecare materie are nume, pictogramă și culoare proprie.

## 7. Generarea flashcardurilor

Fluxul principal:

1. Utilizatoarea selectează materia.
2. Scrie sau lipește notițele lecției.
3. Apasă „Generează întrebări”.
4. Serverul returnează propuneri de întrebare și răspuns.
5. Utilizatoarea le editează, debifează ce nu dorește și confirmă salvarea.
6. Cardurile intră în programul de recapitulare.

Generatorul trebuie să răspundă în limba română și să se bazeze numai pe textul oferit. Dacă serviciul inteligent nu este configurat sau răspunde cu eroare, notițele rămân salvate și aplicația oferă crearea manuală de flashcarduri.

## 8. Instalarea pe iPhone

Aplicația include un ghid vizibil o singură dată:

1. deschide linkul în Safari;
2. apasă butonul Share;
3. alege „Add to Home Screen”;
4. confirmă numele „Școala Mea”;
5. deschide aplicația din pictograma nouă.

PWA-ul trebuie să aibă manifest valid, iconuri potrivite, `display: standalone`, culori de temă și HTTPS în producție.

## 9. Design

### Direcție vizuală

Designul este **Apple-inspired**, nu o copie a componentelor native:

- tipografie bazată pe fonturile sistemului Apple;
- suprafețe translucide cu `backdrop-filter`, blur și margini fine;
- bara de taburi și acțiunile flotante au efect de sticlă;
- conținutul lung folosește suprafețe opace pentru lizibilitate;
- colțuri rotunjite și spațiere generoasă;
- animații scurte și naturale;
- iconuri consistente, preferabil Lucide;
- culori calme, cu albastru ca accent principal și culori distincte pe materii.

Efectul „Liquid Glass” este o interpretare web. API-ul nativ Apple Liquid Glass nu este disponibil într-o aplicație Next.js.

### Dark mode

- opțiunile System, Light și Dark;
- System este valoarea implicită;
- tema se aplică înainte de primul paint pentru a evita flashul alb;
- toate culorile folosesc tokenuri semantice CSS;
- contrastul și transparența sunt verificate în ambele teme;
- `prefers-reduced-transparency` și `prefers-reduced-motion` primesc alternative mai simple.

### Responsive

- ținta principală: iPhone în orientare portret;
- suport bun pentru iPad și desktop;
- conținutul are o lățime maximă pe ecrane mari;
- sunt respectate safe areas pentru notch, Dynamic Island și indicatorul Home.

## 10. Stări importante

Fiecare secțiune trebuie să aibă:

- stare goală cu o acțiune clară;
- skeleton la încărcare;
- mesaj de eroare și opțiune de reîncercare;
- feedback după salvare;
- confirmare înainte de ștergere;
- stare offline care nu promite salvarea datelor pe server.

## 11. Accesibilitate

- zone interactive de minimum 44×44 px;
- navigare corectă cu tastatura;
- etichete accesibile pentru iconuri;
- focus vizibil;
- contrast conform WCAG AA;
- informația nu este transmisă numai prin culoare;
- suport pentru mărirea textului;
- animațiile respectă `prefers-reduced-motion`.

## 12. Confidențialitate și securitate

- cont unic protejat prin autentificare;
- înregistrarea publică dezactivată;
- toate tabelele sunt protejate prin Row Level Security;
- fiecare înregistrare aparține utilizatorului autentificat;
- cheile private și cheia furnizorului AI există numai pe server;
- fără reclame și fără analytics în MVP;
- exportul și ștergerea datelor sunt disponibile din Settings.

## 13. Setări

- System, Light sau Dark;
- administrarea materiilor;
- activarea reminderelor;
- export JSON;
- import JSON cu previzualizare;
- schimbarea parolei;
- deconectare;
- ștergerea tuturor datelor cu o confirmare explicită.

## 14. MVP — criterii de acceptare

MVP-ul este gata când:

- utilizatoarea se poate autentifica și rămâne conectată în PWA;
- paginile private nu sunt accesibile fără sesiune;
- aplicația poate fi adăugată pe Home Screen și pornește standalone;
- materiile pot fi create, editate, ordonate și șterse;
- notele pot fi administrate și media este calculată corect;
- simulatorul nu modifică notele salvate;
- temele pot fi create, filtrate și finalizate;
- lecțiile și notițele pot fi salvate;
- flashcardurile pot fi create manual și generate din notițe;
- propunerile generate trebuie confirmate înainte de salvare;
- recapitularea actualizează data următoarei repetări;
- toate operațiile sunt izolate la utilizatorul autentificat;
- Light Mode și Dark Mode funcționează fără probleme de contrast;
- experiența principală este bună pe iPhone și desktop.

## 15. În afara MVP-ului

- widget iOS nativ;
- publicare în App Store;
- conturi pentru colegi, profesori sau părinți;
- conectare la un catalog școlar;
- funcții sociale și clasamente;
- editare completă offline cu sincronizare ulterioară;
- OCR pentru fotografii din caiet;
- notificări push programate;
- abonamente și plăți.

## 16. Etape recomandate

1. **Fundație:** Next.js, design system, autentificare și bază de date.
2. **Catalog:** materii, note, medii și simulator.
3. **Teme:** creare, filtre, finalizare și dashboard.
4. **Învățare:** lecții, flashcarduri și recapitulare.
5. **Generare:** API server-side pentru întrebări și ecran de verificare.
6. **PWA:** manifest, service worker, instalare și comportament standalone.
7. **Finisare:** dark mode, accesibilitate, export/import și teste.
8. **Opțional:** notificări Web Push și companion nativ pentru widget.

