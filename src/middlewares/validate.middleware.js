const validate = (schemas) => (req, res, next) => {
  const sources = {
    // sin body JSON, Express deja req.body en undefined
    body: req.body ?? {},
    query: req.query,
    params: req.params,
  };

  const validated = {};
  const errors = [];

  for (const [location, schema] of Object.entries(schemas)) {
    const result = schema.safeParse(sources[location]);

    if (result.success) {
      validated[location] = result.data;
    } else {
      for (const issue of result.error.issues) {
        errors.push({ location, field: issue.path.join('.'), message: issue.message });
      }
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      status: 'error',
      message: 'Datos inválidos',
      errors,
    });
  }

  req.validated = validated;
  return next();
};

export { validate };
