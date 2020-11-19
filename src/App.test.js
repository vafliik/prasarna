import React from 'react';
import Feedback from './App';
import { Machine } from 'xstate';
import { render, fireEvent, cleanup } from '@testing-library/react';
import { assert } from 'chai';
import { createModel } from '@xstate/test';

describe('feedback app', () => {
  const feedbackMachine = Machine({
    id: 'feedback',
    initial: 'question',
    states: {
      question: {
        on: {
          CLICK_GOOD: 'thanks',
          CLICK_BAD: 'form',
          CLOSE: 'closed'
        },
        meta: {
          test: ({ getByTestId }) => {
            assert.ok(getByTestId('question-screen'));
          }
        }
      },
      form: {
        on: {
          SUBMIT: [
            {
              target: 'thanks',
              cond: (_, e) => e.value.length
            }
          ],
          CLOSE: 'closed'
        },
        meta: {
          test: ({ getByTestId }) => {
            assert.ok(getByTestId('form-screen'));
          }
        }
      },
      thanks: {
        on: {
          CLOSE: 'closed'
        },
        meta: {
          test: ({ getByTestId }) => {
            assert.ok(getByTestId('thanks-screen'));
          }
        }
      },
      closed: {
        type: 'final',
        meta: {
          test: ({ queryByTestId }) => {
            assert.isNull(queryByTestId('thanks-screen'));
          }
        }
      }
    }
  });

  const testModel = createModel(feedbackMachine, {
    events: {
      CLICK_GOOD: ({ getByText }) => {
        fireEvent.click(getByText('Good'));
      },
      CLICK_BAD: ({ getByText }) => {
        fireEvent.click(getByText('Bad'));
      },
      CLOSE: ({ getByTestId }) => {
        fireEvent.click(getByTestId('close-button'));
      },
      ESC: ({ baseElement }) => {
        fireEvent.keyDown(baseElement, { key: 'Escape' });
      },
      SUBMIT: {
        exec: async ({ getByTestId }, event) => {
          fireEvent.change(getByTestId('response-input'), {
            target: { value: event.value }
          });
          fireEvent.click(getByTestId('submit-button'));
        },
        cases: [{ value: 'something' }, { value: '' }]
      }
    }
  });

  const testPlans = testModel.getSimplePathPlans();

  testPlans.forEach(plan => {
    describe(plan.description, () => {
      afterEach(cleanup);

      plan.paths.forEach(path => {
        it(path.description, () => {
          const rendered = render(<Feedback />);
          return path.test(rendered);
        });
      });
    });
  });

  it('coverage', () => {
    testModel.testCoverage();
  });
});
