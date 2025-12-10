/**
 * Cursor-based pagination helper
 * Uses _id as cursor for efficient pagination
 */

/**
 * Get paginated results using cursor
 * @param {Model} Model - Mongoose model
 * @param {Object} query - MongoDB query
 * @param {Object} options - Pagination options
 * @param {String} options.cursor - Cursor (ObjectId) to start from
 * @param {Number} options.limit - Number of results per page
 * @param {Object} options.sort - Sort object (default: { _id: -1 })
 * @param {Object} options.select - Fields to select
 * @param {Array} options.populate - Populate options
 * @returns {Object} { data, nextCursor, hasMore }
 */
async function cursorPaginate(Model, query = {}, options = {}) {
  const {
    cursor = null,
    limit = 20,
    sort = { _id: -1 },
    select = null,
    populate = null,
    lean = true,
  } = options;

  // Build query with cursor
  const paginatedQuery = { ...query };
  
  if (cursor) {
    // Add cursor condition based on sort direction
    const sortField = Object.keys(sort)[0] || '_id';
    const sortDirection = sort[sortField] || -1;
    
    if (sortField === '_id') {
      // For _id, we can use $gt or $lt
      paginatedQuery._id = sortDirection === -1 
        ? { $lt: cursor } 
        : { $gt: cursor };
    } else {
      // For other fields, we need to handle comparison
      // This is a simplified version - for complex sorts, you may need more logic
      const cursorDoc = await Model.findById(cursor).lean();
      if (cursorDoc) {
        paginatedQuery.$or = [
          { [sortField]: sortDirection === -1 ? { $lt: cursorDoc[sortField] } : { $gt: cursorDoc[sortField] } },
          {
            [sortField]: cursorDoc[sortField],
            _id: sortDirection === -1 ? { $lt: cursor } : { $gt: cursor }
          }
        ];
      }
    }
  }

  // Build query chain
  let queryChain = Model.find(paginatedQuery);

  // Apply select
  if (select) {
    queryChain = queryChain.select(select);
  }

  // Apply populate
  if (populate) {
    if (Array.isArray(populate)) {
      populate.forEach(pop => {
        queryChain = queryChain.populate(pop);
      });
    } else {
      queryChain = queryChain.populate(populate);
    }
  }

  // Apply sort
  queryChain = queryChain.sort(sort);

  // Apply limit (fetch one extra to check if there's more)
  queryChain = queryChain.limit(limit + 1);

  // Apply lean if specified
  if (lean) {
    queryChain = queryChain.lean();
  }

  // Execute query
  const results = await queryChain;

  // Check if there are more results
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;

  // Get next cursor (last item's _id)
  const nextCursor = data.length > 0 ? data[data.length - 1]._id : null;

  return {
    data,
    nextCursor: hasMore ? nextCursor.toString() : null,
    hasMore,
  };
}

/**
 * Get paginated results with total count (for first page only)
 * @param {Model} Model - Mongoose model
 * @param {Object} query - MongoDB query
 * @param {Object} options - Pagination options
 * @returns {Object} { data, nextCursor, hasMore, total }
 */
async function cursorPaginateWithCount(Model, query = {}, options = {}) {
  const result = await cursorPaginate(Model, query, options);
  
  // Only count total if this is the first page (no cursor)
  let total = null;
  if (!options.cursor) {
    try {
      total = await Model.countDocuments(query);
    } catch (error) {
      console.error('Error counting documents:', error);
    }
  }

  return {
    ...result,
    total,
  };
}

module.exports = {
  cursorPaginate,
  cursorPaginateWithCount,
};

