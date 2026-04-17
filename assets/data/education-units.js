window.EDUCATION_UNITS = {
  sharedGlossary: [
    { term: 'Best execution', definition: 'Duty to seek the best overall client result across price, cost, speed, and execution likelihood.' },
    { term: 'Suitability', definition: 'Assessment that a recommendation fits objectives, finances, risk profile, and capacity for loss.' },
    { term: 'Appropriateness', definition: 'Assessment that a client understands product risk in non-advised or execution-only contexts.' },
    { term: 'Conflict of interest', definition: 'A competing incentive that can distort fair client outcomes if not controlled.' },
    { term: 'Market abuse', definition: 'Conduct that harms market integrity, including insider dealing and manipulation.' },
    { term: 'Capacity for loss', definition: 'Level of loss a client can absorb without breaking essential financial goals.' }
  ],
  dependencyMap: [
    { stage: '1. Foundations', items: ['Financial system role', 'Core risk language', 'Client objective logic'] },
    { stage: '2. Conduct Core', items: ['Ethics vs compliance', 'Conflict controls', 'Communication standards'] },
    { stage: '3. Applied Controls', items: ['Client categorization', 'Suitability/appropriateness', 'Financial crime awareness'] },
    { stage: '4. Integrated Practice', items: ['Portfolio recommendation', 'Implementation controls', 'Evidence and review'] }
  ],
  units: {
    unit1: {
      key: 'unit1',
      title: 'Unit 1 — Investment Environment',
      subtitle: 'System foundations before portfolio implementation',
      estimatedReadingTime: '4h 20m',
      difficulty: 'Intermediate',
      framing: 'This is an original learning companion and exam-oriented guide. It is not a textbook replacement.',
      bridgeToNextUnit: 'Unit 1 builds market, legal, and conduct foundations. Unit 2 applies them to day-to-day investment and advisory decisions.',
      chapters: [
        {
          id: 'u1-c1',
          title: 'Financial markets and institutions',
          intro: 'Capital allocation works through institutions, venues, and infrastructure. Market design shapes client outcomes.',
          whyThisMatters: 'An attractive investment thesis can fail if executed in the wrong venue or liquidity regime.',
          learningOutcomes: [
            'Explain how capital flows between savers and issuers.',
            'Compare primary/secondary and exchange/OTC structures.',
            'Evaluate trading cost beyond commissions.'
          ],
          coreConcepts: [
            {
              heading: 'First principles',
              plain: 'Intermediaries exist because direct matching is too slow and risky.',
              technical: 'Intermediation reduces frictions: information asymmetry, maturity mismatch, scale, and custody complexity.',
              application: 'Pre-trade analysis should include spread, impact, and settlement assumptions.',
              caveats: 'Liquidity can disappear quickly under stress.'
            },
            {
              heading: 'Execution quality',
              plain: 'Low fee does not always mean low total cost.',
              technical: 'Total cost includes spread, market impact, delay, taxes, and failed execution opportunity cost.',
              application: 'Use venue and order-type selection rules by instrument liquidity bucket.',
              caveats: 'Backtests often understate real trading friction.'
            }
          ],
          inPractice: {
            title: 'In practice',
            body: 'A portfolio shift in thinly traded assets is phased over multiple sessions and venues to reduce impact cost and slippage.'
          },
          caseStudy: {
            title: 'Mini case study',
            summary: 'A fund rotated quickly in illiquid names and gave up most expected alpha in impact and spread. A revised algorithmic approach improved net outcomes.'
          },
          commonMisunderstandings: [
            'Exchange trading always means low trading cost.',
            'Commission is the only execution cost.',
            'Execution quality is separate from portfolio management.'
          ],
          practicalChecklist: [
            'Define urgency before choosing order strategy.',
            'Estimate round-trip cost, not just entry cost.',
            'Record execution rationale and post-trade outcomes.'
          ],
          roundup: [
            'Market structure is part of risk management.',
            'Execution quality compounds over time.',
            'Net return depends on implementation quality.'
          ],
          examTip: 'Answer in sequence: objective -> market structure -> cost/risk trade-off -> client outcome.',
          questions: [
            {
              question: 'Why are intermediaries central to financial markets?',
              options: [
                'They eliminate all investment risk.',
                'They reduce practical frictions in capital allocation.',
                'They guarantee higher returns.',
                'They remove the need for regulation.'
              ],
              answerIndex: 1,
              reasoning: 'Intermediaries improve efficiency by reducing frictions, but they do not remove risk or regulation needs.',
              wrongReasons: [
                'Risk remains and must be managed.',
                'Returns are not guaranteed.',
                'Regulatory oversight remains essential.'
              ]
            }
          ]
        },
        {
          id: 'u1-c2',
          title: 'Ethics and investment professionalism',
          intro: 'Ethics is the decision-quality layer above rule compliance.',
          whyThisMatters: 'Clients cannot fully observe internal decision processes; trust depends on professional integrity.',
          learningOutcomes: [
            'Differentiate legal compliance from ethical conduct.',
            'Apply conflict-management logic in realistic scenarios.',
            'Communicate risks in fair and balanced terms.'
          ],
          coreConcepts: [
            {
              heading: 'Ethics vs rule minimum',
              plain: '“Can do” is not the same as “should do.”',
              technical: 'Principle-based judgment is needed where rules are incomplete or ambiguous.',
              application: 'Use a fairness test before final recommendation approval.',
              caveats: 'Disclosure alone may not resolve severe conflicts.'
            },
            {
              heading: 'Communication integrity',
              plain: 'Correct facts can still be misleading if risk framing is unbalanced.',
              technical: 'Professional communication should include uncertainty, downside pathways, and assumptions.',
              application: 'Pair plain-language summary with technical assumptions appendix.',
              caveats: 'Overconfidence language increases mis-selling risk.'
            }
          ],
          inPractice: {
            title: 'In practice',
            body: 'Adviser incentives were changed from product sales volume to client-outcome metrics and suitability audit scores.'
          },
          caseStudy: {
            title: 'Mini case study',
            summary: 'A high-commission product was recommended despite poor fit to client loss capacity. Review found ethical and suitability failure.'
          },
          commonMisunderstandings: [
            'No formal breach means no ethical issue.',
            'Disclosure always cures conflict.',
            'Ethics is separate from investment performance quality.'
          ],
          practicalChecklist: [
            'Identify incentive conflicts before recommendation sign-off.',
            'Check if risk/benefit communication is balanced.',
            'Escalate gray-zone cases early.'
          ],
          roundup: [
            'Ethics protects clients and decision quality.',
            'Conflict management should prioritize prevention/control.',
            'Professionalism must be observable in process evidence.'
          ],
          examTip: 'In ethics questions, assess process fairness and foreseeable client outcome, not only rule wording.',
          questions: [
            {
              question: 'Best first action after identifying a material conflict?',
              options: [
                'Proceed and disclose after execution.',
                'Control or remove the conflict before relying on disclosure.',
                'Ignore if expected return is high.',
                'Leave decision entirely to client preference.'
              ],
              answerIndex: 1,
              reasoning: 'Control or elimination is stronger than disclosure-only treatment.',
              wrongReasons: [
                'Late disclosure may not prevent harm.',
                'Return does not justify unfair process.',
                'Client preference does not remove professional duty.'
              ]
            }
          ]
        },
        {
          id: 'u1-c3',
          title: 'UK regulation and conduct obligations',
          intro: 'Regulation defines acceptable behavior from onboarding to execution and reporting.',
          whyThisMatters: 'Weak conduct design leads to predictable client harm and supervisory action.',
          learningOutcomes: [
            'Explain regulatory objectives in client and market terms.',
            'Apply client categorization, promotions, and execution obligations.',
            'Use conflict and client-asset controls in operational workflows.'
          ],
          coreConcepts: [
            {
              heading: 'Architecture to action',
              plain: 'Regulation must become daily behavior, not shelf documentation.',
              technical: 'Outcome-focused supervision expects evidence across the client journey.',
              application: 'Map each client touchpoint to one control and one evidence artifact.',
              caveats: 'Third-party outsourcing does not remove accountability.'
            },
            {
              heading: 'Conduct controls in practice',
              plain: 'Classification and communication quality shape client protection level.',
              technical: 'Best execution, suitability, inducement control, and records are interdependent.',
              application: 'Run periodic quality reviews by product and client type.',
              caveats: 'Price-only routing can breach best-execution obligations.'
            }
          ],
          inPractice: {
            title: 'In practice',
            body: 'The firm moved from rebate-driven routing to outcome-weighted routing after fill-quality analysis showed client slippage.'
          },
          caseStudy: {
            title: 'Mini case study',
            summary: 'A desk selected low-fee venues with weaker execution likelihood in less-liquid instruments; post-trade controls triggered remediation.'
          },
          commonMisunderstandings: [
            'Best execution equals lowest headline fee.',
            'Client categories are one-time administrative labels.',
            'Large custodians reduce need for reconciliation discipline.'
          ],
          practicalChecklist: [
            'Revalidate client category at material changes.',
            'Measure execution outcomes by instrument bucket.',
            'Maintain reconciliations and exception logs for client assets.'
          ],
          roundup: [
            'Conduct quality must be evidenced, not asserted.',
            'Control design should follow the end-to-end client journey.',
            'Documentation quality is central to defensibility.'
          ],
          examTip: 'Where regulation and trading overlap, prioritize best overall client outcome plus evidence trail.',
          questions: [
            {
              question: 'What best describes best execution?',
              options: [
                'Always choose the lowest fee venue.',
                'Seek best overall client result across multiple factors.',
                'Execute immediately regardless of context.',
                'Delegate routing without oversight.'
              ],
              answerIndex: 1,
              reasoning: 'Best execution is multi-factor and context-specific.',
              wrongReasons: [
                'Low fee can still produce poor net result.',
                'Immediate execution can be suboptimal.',
                'Delegation without oversight is weak control.'
              ]
            }
          ]
        },
        {
          id: 'u1-c4',
          title: 'Legal concepts for advice implementation',
          intro: 'Advice quality includes legal feasibility: authority, ownership, and enforceable agreement.',
          whyThisMatters: 'Economically sound recommendations can fail if authority or structure is incorrect.',
          learningOutcomes: [
            'Distinguish legal and beneficial ownership.',
            'Apply contract and agency basics to instructions.',
            'Recognize trust and estate implications for investment implementation.'
          ],
          coreConcepts: [
            {
              heading: 'Ownership and authority',
              plain: 'The beneficial owner may differ from the legal title holder.',
              technical: 'Custody and nominee structures split legal title and beneficial interest, requiring precise authority controls.',
              application: 'Verify signatory and beneficial ownership before accepting non-routine instructions.',
              caveats: 'Assumed family authority is a frequent operational risk.'
            },
            {
              heading: 'Contract and agency discipline',
              plain: 'Instructions are valid only when legal elements are satisfied.',
              technical: 'Offer, acceptance, capacity, and agency scope must be clear and evidenced.',
              application: 'Use mandatory authority checklist before implementation approvals.',
              caveats: 'Urgency is not a substitute for legal validity.'
            }
          ],
          inPractice: {
            title: 'In practice',
            body: 'A transfer request was paused due to unclear power-of-attorney evidence, preventing unauthorized action.'
          },
          caseStudy: {
            title: 'Mini case study',
            summary: 'A trust portfolio was initially designed as if for an individual. Rework aligned allocation with trustee powers and beneficiary timeline.'
          },
          commonMisunderstandings: [
            'Verbal authority is enough for material instructions.',
            'Ownership distinctions only matter in court disputes.',
            'Estate structure can be finalized after product selection.'
          ],
          practicalChecklist: [
            'Confirm authority and beneficial ownership.',
            'Align account structure with legal objectives.',
            'Escalate ambiguous trust/estate instructions.'
          ],
          roundup: [
            'Legal fit is part of suitability.',
            'Authority controls prevent avoidable harm.',
            'Implementation quality requires legal precision.'
          ],
          examTip: 'In legal scenarios, establish authority and ownership structure before discussing product suitability.',
          questions: [
            {
              question: 'Why does legal vs beneficial ownership matter in practice?',
              options: [
                'It rarely affects normal advisory work.',
                'It determines instruction rights, reporting, and custody control.',
                'It only changes expected returns.',
                'It applies only to institutional clients.'
              ],
              answerIndex: 1,
              reasoning: 'Ownership structure drives who can act and how controls apply.',
              wrongReasons: [
                'It is highly relevant in routine operations.',
                'Return impact is indirect at most.',
                'It applies across client types.'
              ]
            }
          ]
        },
        {
          id: 'u1-c5',
          title: 'Client advice process and risk context',
          intro: 'Advice should run as a repeatable process from objective discovery to periodic review.',
          whyThisMatters: 'Many failures come from process gaps, not market direction alone.',
          learningOutcomes: [
            'Apply structured advisory workflow.',
            'Assess risk as multidimensional (market, liquidity, inflation, behavior).',
            'Link recommendations to objective and constraint evidence.'
          ],
          coreConcepts: [
            {
              heading: 'Process architecture',
              plain: 'Start with client goals, then design portfolio around them.',
              technical: 'Fact-find -> objective hierarchy -> constraint map -> analysis -> recommendation -> implementation -> review.',
              application: 'Separate essential goals from aspirational goals when setting risk budget.',
              caveats: 'Questionnaire scores alone are insufficient for suitability.'
            },
            {
              heading: 'Risk in client terms',
              plain: 'Risk is not only volatility; it is failure to meet goals.',
              technical: 'Risk tolerance, return requirement, and [[Capacity for loss::Maximum absorbable loss without critical goal failure]] must be aligned.',
              application: 'Use adverse-scenario discussion in plain language before final sign-off.',
              caveats: 'Behavioral response under stress can dominate model assumptions.'
            }
          ],
          inPractice: {
            title: 'In practice',
            body: 'A two-bucket strategy (near-term spending + long-term growth) reduced panic-selling risk during drawdowns.'
          },
          caseStudy: {
            title: 'Mini case study',
            summary: 'Two clients had similar risk questionnaire scores but very different cash-flow stability; recommendations differed materially after capacity analysis.'
          },
          commonMisunderstandings: [
            'One score can fully represent client risk profile.',
            'Higher target return justifies any drawdown.',
            'Review cadence is optional if performance is good.'
          ],
          practicalChecklist: [
            'Document objective hierarchy and constraints.',
            'Stress test downside and liquidity events.',
            'Set time-based and event-based review triggers.'
          ],
          roundup: [
            'Suitability is process quality plus client fit.',
            'Risk must be interpreted in real-life context.',
            'Clear communication is part of technical correctness.'
          ],
          examTip: 'For suitability questions, compare objective, horizon, liquidity, and loss capacity before product details.',
          questions: [
            {
              question: 'Which is most important in risk-fit recommendation quality?',
              options: [
                'Highest historical return product selection.',
                'Alignment of objective, horizon, and capacity for loss.',
                'Most complex strategy available.',
                'Lowest upfront fee regardless of fit.'
              ],
              answerIndex: 1,
              reasoning: 'Client-fit alignment is the core suitability standard.',
              wrongReasons: [
                'Past return alone is insufficient.',
                'Complexity can increase mismatch risk.',
                'Low fee does not compensate for poor fit.'
              ]
            }
          ]
        },
        {
          id: 'u1-c6',
          title: 'UK taxation and net outcome design',
          intro: 'Clients consume after-tax outcomes, not gross return headlines.',
          whyThisMatters: 'Tax drag, wrapper selection, and transition timing can reshape long-term wealth paths.',
          learningOutcomes: [
            'Use after-tax framing in recommendation analysis.',
            'Integrate wrapper/location logic into implementation.',
            'Balance tax efficiency with suitability and liquidity.'
          ],
          coreConcepts: [
            {
              heading: 'Net return reality',
              plain: 'Gross return is not what clients keep.',
              technical: 'After-tax real return depends on tax treatment, fees, inflation, and realization timing.',
              application: 'Compare alternatives on a net-of-tax basis before switching portfolios.',
              caveats: 'Tax rules change; advice needs periodic refresh.'
            },
            {
              heading: 'Implementation sequencing',
              plain: 'How and when you switch matters as much as what you switch to.',
              technical: 'Transition planning should account for realized gains, annual allowances, and transaction sequencing.',
              application: 'Use phased transitions where immediate tax impact is materially adverse.',
              caveats: 'Tax minimization should not override diversification or risk control.'
            }
          ],
          inPractice: {
            title: 'In practice',
            body: 'A phased transition reduced immediate tax shock and improved projected net wealth versus one-day full switch.'
          },
          caseStudy: {
            title: 'Mini case study',
            summary: 'A high-yield portfolio underperformed on net basis due to tax drag versus a lower-yield, better-located alternative.'
          },
          commonMisunderstandings: [
            'Tax is year-end reporting only.',
            'Lowest tax always means best advice.',
            'Transition timing has little impact.'
          ],
          practicalChecklist: [
            'Model net outcomes before reallocation.',
            'Review wrapper/location alignment.',
            'Document tax assumptions and review date.'
          ],
          roundup: [
            'Tax-aware design is core advice quality.',
            'Net outcomes should drive decisions.',
            'Implementation timing can materially change results.'
          ],
          examTip: 'Frame decisions as net-after-tax outcomes under client constraints, not gross-return ranking.',
          questions: [
            {
              question: 'Why include tax during portfolio construction rather than only post-trade reporting?',
              options: [
                'Tax has minimal long-term impact.',
                'Tax can materially alter compounding and liquidity flexibility.',
                'Tax matters only for institutional investors.',
                'Tax treatment is fixed and timing-independent.'
              ],
              answerIndex: 1,
              reasoning: 'Tax affects long-term compounding path and practical planning flexibility.',
              wrongReasons: [
                'Tax impact can be significant.',
                'Retail and institutional clients both face tax effects.',
                'Timing and realization are often critical.'
              ]
            }
          ]
        }
      ]
    },
    unit2: {
      key: 'unit2',
      title: 'Unit 2 — Investment Practice',
      subtitle: 'Applied conduct, portfolio, and compliance decision-making',
      estimatedReadingTime: '4h 40m',
      difficulty: 'Intermediate–Advanced',
      framing: 'This is an original educational companion for applied learning and exam practice, not an official text replacement.',
      bridgeToNextUnit: 'Unit 2 operationalizes Unit 1 principles: classify, assess, recommend, execute, monitor, and evidence.',
      chapters: [
        {
          id: 'u2-c1',
          title: 'Ethics and professionalism in live practice',
          intro: 'Applied professionalism is tested under pressure: uncertainty, client anxiety, and commercial targets.',
          whyThisMatters: 'Most conduct failures emerge from rushed judgments, not explicit intent.',
          learningOutcomes: [
            'Use ethical triage in time-sensitive decisions.',
            'Evidence judgment quality in recommendation records.',
            'Balance urgency with client protection duties.'
          ],
          coreConcepts: [
            {
              heading: 'Pressure-tested decision logic',
              plain: 'Fast decisions still need structured thinking.',
              technical: 'Use harm analysis, reversibility checks, and challenge escalation for gray-zone decisions.',
              application: 'Apply a quick test: who benefits, who bears downside, and what evidence supports fairness?',
              caveats: 'Urgency does not justify control bypass.'
            }
          ],
          inPractice: {
            title: 'In practice',
            body: 'During sharp volatility, advisors used a crisis protocol and staged de-risking instead of immediate all-cash moves.'
          },
          caseStudy: {
            title: 'Mini case study',
            summary: 'A product launch was delayed until target-market fit and communication quality were validated under independent review.'
          },
          commonMisunderstandings: [
            'Escalation slows business and should be avoided.',
            'Client insistence always overrides advice duty.',
            'Ethical judgment cannot be documented.'
          ],
          practicalChecklist: [
            'Run harm/fairness check before execution.',
            'Document alternatives and rejection reasons.',
            'Escalate materially conflicted recommendations.'
          ],
          roundup: [
            'Ethics in practice is process discipline.',
            'Quality judgment is auditable when documented.',
            'Pressure should strengthen controls, not weaken them.'
          ],
          examTip: 'When all options appear legal, select the one with strongest fairness and client-outcome evidence.',
          questions: [
            {
              question: 'Best response to high-pressure sales push for complex product?',
              options: [
                'Launch immediately and disclose later.',
                'Pause and validate fit, controls, and communication first.',
                'Launch only for vocal clients.',
                'Skip challenge review to meet deadline.'
              ],
              answerIndex: 1,
              reasoning: 'Structured pre-launch validation is the strongest professional response.',
              wrongReasons: [
                'Post-hoc disclosure can be too late.',
                'Client demand alone is insufficient for suitability.',
                'Skipping review raises foreseeable harm risk.'
              ]
            }
          ]
        },
        {
          id: 'u2-c2',
          title: 'Regulatory architecture to operational conduct',
          intro: 'Policy language must become practical workflow controls.',
          whyThisMatters: 'Firms are judged on outcomes and evidence, not policy volume.',
          learningOutcomes: [
            'Convert conduct obligations into frontline checkpoints.',
            'Define escalation ownership and response time targets.',
            'Use monitoring metrics to improve controls.'
          ],
          coreConcepts: [
            {
              heading: 'Control mapping',
              plain: 'Each journey step needs a clear control and record.',
              technical: 'First-line action, second-line challenge, and exception management should be linked by measurable indicators.',
              application: 'Create recommendation packs with objective mapping, risk fit, communication check, and sign-off evidence.',
              caveats: 'Overcomplex controls can become “tick-box” and lose effectiveness.'
            }
          ],
          inPractice: {
            title: 'In practice',
            body: 'A conduct dashboard tracked file quality, suitability exceptions, and remediation cycle times, revealing root-cause training gaps.'
          },
          caseStudy: {
            title: 'Mini case study',
            summary: 'Recommendation inconsistency across advisors was reduced with standardized templates and peer challenge review.'
          },
          commonMisunderstandings: [
            'Annual policy attestations prove effective conduct.',
            'Monitoring is only compliance team responsibility.',
            'Low complaint volume means controls are strong.'
          ],
          practicalChecklist: [
            'Define controls at each client stage.',
            'Assign named owners and escalation deadlines.',
            'Track leading indicators and close the feedback loop.'
          ],
          roundup: [
            'Operationalization is the core regulatory skill.',
            'Metrics should trigger action, not static reporting.',
            'Ownership clarity improves control reliability.'
          ],
          examTip: 'A strong answer links policy intent, operational behavior, and measurable evidence.',
          questions: [
            {
              question: 'Best indicator of an effective conduct framework?',
              options: [
                'Long policy manual and completed attestations.',
                'Early risk detection and measurable remediation outcomes.',
                'One quarter with no complaints.',
                'Delegated controls with minimal reporting.'
              ],
              answerIndex: 1,
              reasoning: 'Effectiveness is proven by early detection and successful corrective action.',
              wrongReasons: [
                'Documentation alone is insufficient.',
                'Short periods can hide latent issues.',
                'Low-reporting delegation weakens oversight.'
              ]
            }
          ]
        },
        {
          id: 'u2-c3',
          title: 'Client categorization and suitability/appropriateness pathways',
          intro: 'Classification and assessment logic determines protection depth and recommendation defensibility.',
          whyThisMatters: 'Misclassification can create cascading errors across communication, controls, and outcomes.',
          learningOutcomes: [
            'Differentiate classification levels and implications.',
            'Apply suitability for advised services and appropriateness for relevant non-advised cases.',
            'Handle edge cases and service-boundary clarity.'
          ],
          coreConcepts: [
            {
              heading: 'Classification implications',
              plain: 'Client category changes what protections and checks are required.',
              technical: 'Category affects disclosures, governance expectations, and recourse assumptions.',
              application: 'Reassess category when service scope or client circumstances materially change.',
              caveats: 'Confidence and wealth do not automatically satisfy professional criteria.'
            },
            {
              heading: 'Assessment boundary control',
              plain: 'Suitability and appropriateness answer different questions.',
              technical: 'Suitability evaluates recommendation fit; appropriateness evaluates client risk understanding for applicable non-advised services.',
              application: 'Document advised and execution-only decisions separately in mixed-service models.',
              caveats: 'Boundary blur is a recurring enforcement risk.'
            }
          ],
          inPractice: {
            title: 'In practice',
            body: 'A client used advised core mandates but execution-only complex trades; separate appropriateness and disclosure records were maintained.'
          },
          caseStudy: {
            title: 'Mini case study',
            summary: 'A reclassification request was denied due to insufficient experience evidence; staged education and reduced-complexity alternatives were offered.'
          },
          commonMisunderstandings: [
            'High net worth equals automatic professional status.',
            'Client preference can override suitability checks.',
            'Appropriateness warnings have no control significance.'
          ],
          practicalChecklist: [
            'Evidence classification criteria objectively.',
            'Separate records by service type.',
            'Trigger reassessment at major life or mandate changes.'
          ],
          roundup: [
            'Classification is a core control gate.',
            'Suitability and appropriateness must not be conflated.',
            'Clear service boundaries protect clients and firms.'
          ],
          examTip: 'Resolve category first, then derive required assessment and disclosure obligations.',
          questions: [
            {
              question: 'Correct distinction between suitability and appropriateness?',
              options: [
                'They are equivalent assessments.',
                'Suitability checks recommendation fit; appropriateness checks understanding in relevant non-advised contexts.',
                'Appropriateness is only for low-risk products.',
                'Suitability only applies to professional clients.'
              ],
              answerIndex: 1,
              reasoning: 'They are distinct tests with different triggers and scope.',
              wrongReasons: [
                'Conflation causes process errors.',
                'Appropriateness often matters most for complex risks.',
                'Suitability is strongly relevant to retail advised services.'
              ]
            }
          ]
        },
        {
          id: 'u2-c4',
          title: 'Market abuse and financial crime awareness',
          intro: 'Integrity controls are fundamental to investment practice, not specialist side tasks.',
          whyThisMatters: 'Weak abuse and AML controls can produce major harm, sanctions, and trust erosion.',
          learningOutcomes: [
            'Recognize market-abuse patterns and escalation duties.',
            'Apply AML/sanctions logic through onboarding and ongoing monitoring.',
            'Identify red flags and preserve evidence quality.'
          ],
          coreConcepts: [
            {
              heading: 'Market integrity controls',
              plain: 'Insider misuse and manipulation break fair markets.',
              technical: 'Information barriers, surveillance, restricted lists, and suspicious activity workflows are key controls.',
              application: 'Capture who knew what and when in all material escalations.',
              caveats: 'Automated alerts need informed human review.'
            },
            {
              heading: 'AML lifecycle',
              plain: 'Know-your-client is continuous, not one-time.',
              technical: 'CDD/EDD, beneficial ownership, transaction monitoring, and sanctions screening must adapt to risk changes.',
              application: 'Use trigger-based KYC refresh for activity spikes or ownership changes.',
              caveats: 'Long-standing client relationships do not reduce monitoring duty.'
            }
          ],
          inPractice: {
            title: 'In practice',
            body: 'Dormant-account high-value transfers triggered coordinated review and documented escalation before further dealing.'
          },
          caseStudy: {
            title: 'Mini case study',
            summary: 'A timing pattern around non-public earnings information triggered surveillance review and conduct remediation.'
          },
          commonMisunderstandings: [
            'AML checks are onboarding-only tasks.',
            'No completed trade means no abuse risk.',
            'Only compliance staff need abuse-awareness training.'
          ],
          practicalChecklist: [
            'Escalate unusual patterns with clear timeline.',
            'Maintain restricted-list discipline.',
            'Record alert closure rationale with evidence.'
          ],
          roundup: [
            'Integrity controls require continuous vigilance.',
            'Early escalation improves defensibility.',
            'Frontline awareness is essential control capacity.'
          ],
          examTip: 'Lead with containment, escalation, and evidence preservation in abuse/crime questions.',
          questions: [
            {
              question: 'Best action when suspicious transaction behavior appears?',
              options: [
                'Ignore until regulator request arrives.',
                'Continue normally due to long client relationship.',
                'Escalate promptly through formal channels with documented facts.',
                'Immediately close account without records.'
              ],
              answerIndex: 2,
              reasoning: 'Prompt structured escalation with evidence is the correct control response.',
              wrongReasons: [
                'Delay increases risk.',
                'Relationship tenure does not remove duty.',
                'Undocumented action weakens governance and legal defensibility.'
              ]
            }
          ]
        },
        {
          id: 'u2-c5',
          title: 'Portfolio and advisory process links from Unit 1',
          intro: 'This chapter turns Unit 1 constraints into portfolio design and review decisions.',
          whyThisMatters: 'Portfolio math without client-context controls can produce unsuitable outcomes.',
          learningOutcomes: [
            'Translate objective/constraint maps into allocation logic.',
            'Integrate execution and review into recommendation architecture.',
            'Evaluate alternatives by fit under stress, not only expected return.'
          ],
          coreConcepts: [
            {
              heading: 'Constraint-aware portfolio design',
              plain: 'Client realities determine what risk is acceptable.',
              technical: 'Risk budget, liquidity laddering, and scenario-based drawdown tolerances should guide allocation decisions.',
              application: 'Map each portfolio sleeve to a specific objective and time horizon.',
              caveats: 'Optimization outputs are only as reliable as assumptions.'
            },
            {
              heading: 'Governed review process',
              plain: 'Rebalancing should follow rules, not emotions.',
              technical: 'Use periodic, threshold, and event-triggered reviews to keep risk and suitability aligned.',
              application: 'Predefine responses for drawdowns, income shocks, and objective shifts.',
              caveats: 'Frequent discretionary changes can increase costs and behavior errors.'
            }
          ],
          inPractice: {
            title: 'In practice',
            body: 'Near-term liabilities were ring-fenced into lower-volatility assets while long-term growth capital remained diversified.'
          },
          caseStudy: {
            title: 'Mini case study',
            summary: 'A client with uncertain cash-flow needs was better suited to transparent, liquid implementation despite lower headline expected return.'
          },
          commonMisunderstandings: [
            'Highest expected return is always best.',
            'Rebalancing should be fully discretionary.',
            'Client constraints stay fixed over time.'
          ],
          practicalChecklist: [
            'Link sleeves to objectives and constraints.',
            'Stress-test downside and liquidity events.',
            'Set clear review and rebalancing triggers.'
          ],
          roundup: [
            'Suitability is fit under uncertainty, not return maximization alone.',
            'Rule-based review improves consistency.',
            'Net outcomes depend on implementation quality.'
          ],
          examTip: 'Compare options on resilience under client constraints, not only base-case return.',
          questions: [
            {
              question: 'Main benefit of predefined rebalancing rules?',
              options: [
                'Maximize turnover opportunities.',
                'Reduce emotional decisions and maintain target risk alignment.',
                'Eliminate market risk.',
                'Avoid documenting advisory logic.'
              ],
              answerIndex: 1,
              reasoning: 'Rules enforce discipline and keep portfolio risk aligned with policy.',
              wrongReasons: [
                'Excess turnover can reduce net performance.',
                'Market risk cannot be eliminated.',
                'Documentation remains mandatory.'
              ]
            }
          ]
        },
        {
          id: 'u2-c6',
          title: 'Practical compliance behavior and documentation pathways',
          intro: 'Defensible decisions require structured workflow, clear records, and edge-case escalation discipline.',
          whyThisMatters: 'In audits and disputes, undocumented reasoning is treated as absent reasoning.',
          learningOutcomes: [
            'Build decision pathways with clear control gates.',
            'Document recommendations for auditability and client clarity.',
            'Handle edge cases with proportional escalation.'
          ],
          coreConcepts: [
            {
              heading: 'Decision pathway design',
              plain: 'Good decisions follow a repeatable route.',
              technical: 'Issue identification, risk assessment, challenge, approval, implementation, and review should each leave evidence.',
              application: 'Use standard templates for rationale, alternatives, sign-off, and client communication outcomes.',
              caveats: 'Templates support thinking; they do not replace judgment.'
            },
            {
              heading: 'Edge-case governance',
              plain: 'Complex or vulnerable-client cases need stronger controls.',
              technical: 'Exception handling should include materiality threshold, senior review, and post-event control feedback.',
              application: 'Trigger enhanced review for vulnerability, complexity, or unusual urgency.',
              caveats: 'Frequent exceptions signal process design weakness.'
            }
          ],
          inPractice: {
            title: 'In practice',
            body: 'A standardized recommendation file reduced remediation effort and improved consistency in supervisory review.'
          },
          caseStudy: {
            title: 'Mini case study',
            summary: 'A vulnerable client requested a concentrated speculative trade; enhanced review and scenario communication led to a constrained implementation path.'
          },
          commonMisunderstandings: [
            'Documentation is administrative overhead only.',
            'Exceptional client requests should bypass controls.',
            'Good intent compensates for incomplete records.'
          ],
          practicalChecklist: [
            'Use consistent decision templates for material cases.',
            'Record rejected alternatives and rationale.',
            'Apply enhanced controls for vulnerable-client scenarios.'
          ],
          roundup: [
            'Process evidence is central to professional defensibility.',
            'Edge-case quality depends on escalation clarity.',
            'Documentation protects both client and advisor.'
          ],
          examTip: 'Answer edge cases in strict sequence: identify risk -> apply controls -> escalate -> evidence outcome.',
          questions: [
            {
              question: 'Why document rejected alternatives in a recommendation file?',
              options: [
                'To increase document length for audit optics.',
                'To evidence reasoned, comparative judgment.',
                'Because every possible option must always be listed.',
                'To discourage client follow-up questions.'
              ],
              answerIndex: 1,
              reasoning: 'Rejected alternatives show disciplined analysis and suitability reasoning.',
              wrongReasons: [
                'Volume is not quality.',
                'Documentation should be material and decision-relevant.',
                'Client understanding should be supported, not suppressed.'
              ]
            }
          ]
        }
      ]
    }
  }
};
