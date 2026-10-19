// Al estar en el mismo puerto, io() sabe automáticamente a dónde conectarse
const socket = io();

socket.on('connect', () => {
  console.log('¡Me he conectado al servidor con éxito!');
});

const createElement = (tag, className, text) => {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
};

const createServiceCard = (service) => {
  const card = createElement('li', 'service-card');

  card.append(createElement('h2', 'service-name', service.name));
  card.append(createElement('p', 'service-description', service.description));

  const price = createElement('p', null, 'Precio: ');
  price.append(createElement('strong', null, `$${service.price}`));
  card.append(price);

  card.append(createElement('p', null, `Duración: ${service.duration} minutos`));

  card.append(
    service.available
      ? createElement('span', 'badge badge--ok', 'Disponible')
      : createElement('span', 'badge badge--off', 'Sin disponibilidad')
  );

  const categories = createElement('p', 'service-categories');
  for (const category of service.category ?? []) {
    categories.append(createElement('span', 'tag', category));
  }
  card.append(categories);

  return card;
};

socket.on('service:created', (service) => {
  console.log('Evento recibido:', service);

  const list = document.querySelector('.services-list');
  if (!list) return;

  list.querySelector('.empty')?.remove();

  list.append(createServiceCard(service));
});
