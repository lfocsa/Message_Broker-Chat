# Message Broker Chat

Pentru a executa aplicatia: 
1. npm install
2. node index
3. localhost:340  -> instanta de chat



<b>Sarcinile propuse:</b>
a. Messaging Systems,
b. Messaging Channels,
c. Message Constructions,
d. Message Routing,
e. Message Transformation,
f. Messaging endpoints,
g. System management.


<b>Implimentarea:</b>
a. Messaging Systems -  Crearea evenimentelor de socket.io: client/server
 Evenimente:
 - conexiune
 - initializarea
 - lista persoanelor online
 - taparea mesajului
 - transmiterea mesajelor
 - deconexiunea
 
<b>b. Messaging Channels</b> - crearea canalelor private.
Inserarea Uilizatorului nou in baza de date, Switch Channels.

<b>c.Message Constructions</b> - Socket.io oferă posibilitatea de potrivit mesajele cererii și răspunsului într­un sistem de mesagerie asincronă prin atașare mesajului unui identificator de corelare.
id de corelare este socket.id

<b>d. Message Routing</b> -Ruterul bazat pe conținut examinează mesajul și îl rutează în dependență de datele conținute în mesaj. 

<b>e. Message Transformation</b> - De ex: la scrierea unui mesaj ce contine code js, html, executarea acestuia nu va avea loc, se va afisa simplu text.

Nu se va executa JS, html nu se va compila

<b>f. Messaging endpoints</b> - Un consumator de acest tip va aștepta un mesaj, îl va procesa și va trece spre următorul mesaj.
Astfel acest șablon este prin definiție sincron, căci va bloca firul pînă la venirea următorului mesaj.
Ordinea mesajului va fi respecta in dependenta de ordinea in care acestea au fost expediate. 


<b>Metoda de utilizarea a Aplicatiei de catre utilizator:</b>
1. se logheza cu un user name
2. faci parte din chatul comun
3. poti alege un utilizator din chat pentru ai trimite un mesaj privat
4. poti primi mesaje de la utilizatorii conectati






