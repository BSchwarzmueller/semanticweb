export default class University {

  id;
  coordinates;
  name;
  logo;
  employeesCount;
  studentsCount;
  inception;
  proflist;

  constructor(uni) {
    console.log('uni: ', uni);
    this.id = uni.university.value.slice(31);

    try {
      const [lng, lat] = uni.location.value
        .slice(6, -1)
        .split(' ')
        .map(value => parseFloat(value));
      this.coordinates = { lat, lng };
    } catch (err) {
      console.error('Wrong coordinates');
    }
    try {
      this.name = uni.universityLabel.value;
    } catch (err) { /* safely ignore */ }
    try {
      this.logo = decodeURIComponent(uni.logo.value.slice(51)); // Dateiname des Logos
    } catch (err) { /* safely ignore */ }
    try {
      this.employeesCount = uni.employeesCount.value;
    } catch (err) { /* safely ignore */ }
    try {
      this.studentsCount = uni.studentsCount.value;
    } catch (err) { /* safely ignore */ }
    try {
      this.inception = uni.inception.value.slice(0, 4); // Nur Jahreszahl
    } catch (err) { /* safely ignore */ }
  }
  get imageURL() {
    if (!this.logo) { return null; }
    return [
      '//commons.wikimedia.org/w/index.php?title=',
      'Special:Redirect/file/',
      encodeURIComponent(this.logo),
      '&width=',
      120,
    ].join('');
  }
}
