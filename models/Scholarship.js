const mongoose = require('mongoose');

const scholarshipSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'USD',
    },
    provider: {
      type: String,
      required: true,
    },
    eligibility: [String],
    deadline: {
      type: Date,
      required: true,
    },
    link: {
      type: String,
      default: null,
    },
    category: {
      type: String,
      enum: ['merit-based', 'need-based', 'diversity', 'field-specific'],
      default: 'merit-based',
    },
    applicationCount: {
      type: Number,
      default: 0,
    },
    applicants: [
      {
        student: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        appliedAt: {
          type: Date,
          default: Date.now,
        },
        status: {
          type: String,
          enum: ['applied', 'under-review', 'accepted', 'rejected'],
          default: 'applied',
        },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Scholarship', scholarshipSchema);
