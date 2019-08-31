export default class Professor {
  id;
  name;
  fachbereich;

  constructor(prof) {
    this.id = prof.prof.value.slice(31);
    try {
      this.name = prof.profLabel.value;
    } catch (err) { /* safely ignore */ }
    try {
      this.fachbereich = prof.fachbereichLabel.value;
    } catch (err) { /* safely ignore */ }
  }
}
