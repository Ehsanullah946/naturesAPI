class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  Filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);

    // 2. Advanced filtering
    //  http://localhost:3000/api/v1/tours?duration[gt]=5&difficulty=easy
    const filter = {};
    for (let key in queryObj) {
      if (key.includes('[')) {
        // e.g. duration[gte] => key = "duration[gte]"
        const parts = key.split('[');
        const field = parts[0]; // duration
        const operator = parts[1].replace(']', ''); // gte

        if (!filter[field]) filter[field] = {};
        filter[field][`$${operator}`] = Number(queryObj[key]);
      } else {
        filter[key] = queryObj[key];
      }
    }

    // 3. Build the query
    this.query = this.query.find(filter);

    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__V');
    }
    return this;
  }

  pagination() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}
module.exports = APIFeatures;
