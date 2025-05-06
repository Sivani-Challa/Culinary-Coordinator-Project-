// src/components/pages/FAQs.js
import React from 'react';
import { Typography, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PageTemplate from './PageTemplate';

const faqs = [
  {
    id: 1,
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards (Visa, MasterCard, American Express, Discover), PayPal, and Apple Pay. We currently do not accept checks or money orders."
  },
  {
    id: 2,
    question: "How long will it take to receive my order?",
    answer: "Standard shipping typically takes 3-5 business days. Express shipping is available for an additional fee and typically arrives within 1-2 business days. Please note that delivery times may be longer for remote locations."
  },
  {
    id: 3,
    question: "What is your return policy?",
    answer: "We accept returns within 30 days of delivery for unused products in their original packaging. Perishable items cannot be returned unless they arrived damaged or spoiled. Please visit our Returns & Refunds page for more details."
  },
  {
    id: 4,
    question: "Do you ship internationally?",
    answer: "Yes, we ship to most countries worldwide. International shipping rates and delivery times vary depending on the destination. Please note that customers are responsible for any customs duties or taxes imposed by their country."
  },
  {
    id: 5,
    question: "How can I track my order?",
    answer: "Once your order ships, you will receive a confirmation email with a tracking number. You can use this number to track your package on our website or directly on the carrier's website."
  },
  {
    id: 6,
    question: "Are your products organic?",
    answer: "We offer both organic and conventional products. All organic products are clearly labeled and certified by appropriate organic certification agencies."
  }
];

const FAQs = () => {
  const content = (
    <>
      <Typography paragraph>
        Find answers to commonly asked questions about our products, shipping, returns, and more.
        If you can't find the answer you're looking for, please contact our customer service team.
      </Typography>
      
      {faqs.map((faq) => (
        <Accordion key={faq.id}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls={`faq-${faq.id}-content`}
            id={`faq-${faq.id}-header`}
          >
            <Typography fontWeight="medium">{faq.question}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>{faq.answer}</Typography>
          </AccordionDetails>
        </Accordion>
      ))}
    </>
  );

  return <PageTemplate title="Frequently Asked Questions" content={content} />;
};

export default FAQs;