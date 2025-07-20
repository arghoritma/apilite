export const userValidation = {
  register: {
    name: {
      required: true,
      minLength: 3,
      maxLength: 30
    },
    email: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
    password: {
      required: true,
      minLength: 6,
      maxLength: 50
    }
  },
  login: {
    email: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
    password: {
      required: true
    }
  }
};