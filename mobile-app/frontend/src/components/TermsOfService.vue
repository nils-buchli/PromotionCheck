<template>
    <PrivacyPolicy v-if="showPrivacyPolicy" @back="showPrivacyPolicy = false"/>
    
    <main v-else class="flex flex-col h-full w-full overflow-hidden">
        <div class="flex flex-col flex-1 bg-zinc-50 overflow-y-auto">
            <div class="max-w-2xl mx-auto w-full px-6 py-12">

                 <!-- Back -->
                <div class="mb-8">
                    <button
                        type="button"
                        @click="$emit('back')"
                        class="flex items-center gap-1.5 text-zinc-400 active:text-zinc-600 transition-colors"
                        style="-webkit-tap-highlight-color: transparent;"
                    >
                        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M15 18l-6-6 6-6"/>
                        </svg>
                        <span class="text-[13px] font-medium">Back</span>
                    </button>
                </div>

                <div class="mb-10">
                    <p class="text-xs font-mono text-zinc-400 uppercase tracking-widest mb-3">Legal</p>
                    <h1 class="text-3xl font-semibold text-zinc-900 mb-2">Terms of Service</h1>
                    <p class="text-sm text-zinc-400">Last updated: {{ lastUpdated }}</p>
                </div>

                <!-- Preamble -->
                <div class="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 mb-10">
                    <p class="text-sm text-amber-800 leading-relaxed">
                        <strong>Please read these Terms carefully before using {{ appName }}.</strong>
                        By creating an account or using the application in any way, you confirm that you
                        have read, understood, and agree to be bound by these Terms. If you do not agree,
                        do not use the application.
                    </p>
                </div>

                <div class="space-y-10 text-zinc-700 text-sm leading-relaxed">

                    <!-- 1 -->
                    <section>
                        <h2 class="text-base font-semibold text-zinc-900 mb-3">1. Definitions</h2>
                        <ul class="space-y-2 list-disc list-inside text-zinc-600">
                            <li><strong>"Application"</strong> means the {{ appName }} web application and all related services.</li>
                            <li><strong>"Operator"</strong> means {{ operatorName }}, the individual operating the Application as a non-commercial, private project.</li>
                            <li><strong>"User"</strong> means any natural person who accesses or uses the Application.</li>
                            <li><strong>"Content"</strong> means any data, text, or information a User submits to the Application (e.g. grade data, usernames).</li>
                            <li><strong>"Terms"</strong> means these Terms of Service in their current version.</li>
                        </ul>
                    </section>

                    <hr class="border-zinc-200" />

                    <!-- 2 -->
                    <section>
                        <h2 class="text-base font-semibold text-zinc-900 mb-3">2. Nature of the Service</h2>
                        <p>
                            {{ appName }} is a <strong>free, non-commercial, private project</strong> operated by
                            an individual. The Application is provided at no charge and without any commercial intent.
                            No subscription, fee, or payment of any kind is charged for use of the Application.
                        </p>
                        <p class="mt-2">
                            The Application is provided <strong>"as is"</strong> and <strong>"as available"</strong>,
                            without any warranty of any kind, express or implied, including but not limited to
                            warranties of merchantability, fitness for a particular purpose, availability,
                            accuracy, or non-infringement.
                        </p>
                        <p class="mt-2">
                            The Operator reserves the right to modify, suspend, or discontinue the Application
                            (in whole or in part) at any time, with or without notice, and without incurring any
                            liability to Users.
                        </p>
                    </section>

                    <hr class="border-zinc-200" />

                    <!-- 3 -->
                    <section>
                        <h2 class="text-base font-semibold text-zinc-900 mb-3">3. Eligibility & Account Registration</h2>
                        <p>You may use the Application if you:</p>
                        <ul class="mt-2 list-disc list-inside space-y-1 text-zinc-600">
                            <li>are at least 13 years of age, or have the consent of a parent or guardian;</li>
                            <li>keep your login credentials confidential and do not share your account.</li>
                        </ul>
                        <p class="mt-3">
                            You are solely responsible for all activity that occurs under your account.
                            If you become aware of any unauthorised use of your account, you must notify us
                            immediately at <a :href="'mailto:' + contactEmail"
                            class="text-zinc-900 underline underline-offset-2">{{ contactEmail }}</a>.
                        </p>
                        <p class="mt-2">
                            The Operator reserves the right to suspend or terminate any account at any time,
                            without prior notice, if these Terms are violated or if the account is used in a
                            manner the Operator deems inappropriate or harmful.
                        </p>
                    </section>

                    <hr class="border-zinc-200" />

                    <!-- 4 -->
                    <section>
                        <h2 class="text-base font-semibold text-zinc-900 mb-3">4. Acceptable Use</h2>
                        <p>You agree to use the Application only for its intended purpose (recording and reviewing personal academic grades) and in compliance with all applicable laws.</p>
                        <p class="mt-3">You must <strong>not</strong>:</p>
                        <ul class="mt-2 space-y-1 list-disc list-inside text-zinc-600">
                            <li>use the Application for any unlawful, fraudulent, or abusive purpose;</li>
                            <li>attempt to gain unauthorised access to the Application, its servers, or any related systems;</li>
                            <li>interfere with or disrupt the integrity or performance of the Application;</li>
                            <li>conduct automated requests (scraping, bots, crawlers) without prior written consent;</li>
                            <li>reverse-engineer, decompile, or otherwise attempt to derive the source code of the Application;</li>
                            <li>upload, transmit, or distribute any malware, virus, or other harmful code;</li>
                            <li>impersonate any person or entity or misrepresent your identity;</li>
                            <li>use the Application on behalf of a commercial entity or for a commercial purpose;</li>
                            <li>circumvent any technical measures used to protect the Application.</li>
                        </ul>
                        <p class="mt-3">
                            Violation of these rules may result in immediate account termination and, where appropriate,
                            referral to law enforcement authorities.
                        </p>
                    </section>

                    <hr class="border-zinc-200" />

                    <!-- 5 -->
                    <section>
                        <h2 class="text-base font-semibold text-zinc-900 mb-3">5. User Content</h2>
                        <p>
                            You retain full ownership of all Content you submit to the Application.
                            By submitting Content, you grant the Operator a limited, non-exclusive, royalty-free
                            licence to store and process that Content solely for the purpose of providing the
                            Application's functionality to you.
                        </p>
                        <p class="mt-2">
                            You represent and warrant that your Content does not infringe any third-party rights
                            and does not violate any applicable law. You are solely responsible for the accuracy
                            and legality of your Content.
                        </p>
                        <p class="mt-2">
                            The Operator does not review, monitor, or endorse any Content submitted by Users.
                        </p>
                    </section>

                    <hr class="border-zinc-200" />

                    <!-- 6 CORE: liability exclusion -->
                    <section>
                        <h2 class="text-base font-semibold text-zinc-900 mb-3">6. Disclaimer of Warranties & Limitation of Liability</h2>

                        <div class="bg-zinc-100 rounded-xl border border-zinc-200 px-5 py-4 mb-4">
                            <p class="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-2">Core Disclaimer</p>
                            <p class="text-zinc-700">
                                To the maximum extent permitted by applicable law: in particular
                                <strong>Art. 100 of the Swiss Code of Obligations (OR)</strong>: the Operator
                                <strong>excludes all liability</strong> for any direct, indirect, incidental,
                                special, consequential, or exemplary damages arising out of or in connection with
                                the use of, or inability to use, the Application.
                            </p>
                        </div>

                        <p>This includes, without limitation:</p>
                        <ul class="mt-2 space-y-1 list-disc list-inside text-zinc-600">
                            <li>loss of data or Content;</li>
                            <li>inaccuracy of calculated averages or displayed values;</li>
                            <li>interruption, suspension, or discontinuation of the Application;</li>
                            <li>unauthorised access to or alteration of your data by third parties;</li>
                            <li>any loss of profit, revenue, business, or goodwill;</li>
                            <li>reliance on the Application for any academic, professional, or legal decision.</li>
                        </ul>
                        <p class="mt-3">
                            The Application is a <strong>personal tool for informational purposes only</strong>.
                            It does not constitute academic advice, and the Operator makes no guarantee as to the
                            correctness of any computed value.
                        </p>
                        <p class="mt-3">
                            Where liability cannot be fully excluded under mandatory Swiss law (e.g. for gross
                            negligence or wilful misconduct), the Operator's total liability shall in any event
                            be limited to <strong>CHF 0</strong>, reflecting the free and non-commercial nature
                            of the Application.
                        </p>
                    </section>

                    <hr class="border-zinc-200" />

                    <!-- 7 Abmahn protection -->
                    <section>
                        <h2 class="text-base font-semibold text-zinc-900 mb-3">7. No Commercial Relationship: Protection Against Abusive Claims</h2>
                        <p>
                            The Application is provided free of charge for personal, non-commercial use.
                            <strong>No commercial relationship exists</strong> between the Operator and any User.
                            No consumer protection rights that presuppose a paid transaction are triggered by
                            use of the Application.
                        </p>
                        <p class="mt-2">
                            Any claim, demand, or legal notice (<em>Abmahnung</em> or equivalent) directed at
                            the Operator in connection with the Application must be submitted in writing to
                            the contact address below <strong>before</strong> initiating any formal or court
                            proceeding. The Operator shall have 30 days to respond or remedy any alleged violation.
                        </p>
                        <p class="mt-2">
                            The Operator explicitly rejects any claim for reimbursement of legal costs, attorney
                            fees, or lump-sum damages arising from out-of-court demand letters (<em>Abmahnkosten</em>)
                            where no prior direct contact was made and where the Application is operated on a
                            strictly non-commercial basis.
                        </p>
                        <p class="mt-2">
                            Any purported claim based on unfair competition law (UCA / UWG) is excluded insofar
                            as the Application pursues no commercial purpose and generates no revenue.
                        </p>
                    </section>

                    <hr class="border-zinc-200" />

                    <!-- 8 -->
                    <section>
                        <h2 class="text-base font-semibold text-zinc-900 mb-3">8. Intellectual Property</h2>
                        <p>
                            All software, design, code, and content of the Application (excluding User Content)
                            is the intellectual property of the Operator and is protected under Swiss copyright law
                            (URG) and applicable international treaties.
                        </p>
                        <p class="mt-2">
                            You are granted a limited, personal, non-exclusive, non-transferable, revocable
                            licence to access and use the Application solely for its intended purpose.
                            No rights are transferred to you beyond this licence.
                        </p>
                        <p class="mt-2">
                            You may not copy, reproduce, distribute, modify, create derivative works of, or
                            commercially exploit any part of the Application without the Operator's prior
                            written consent.
                        </p>
                    </section>

                    <hr class="border-zinc-200" />

                    <!-- 9 -->
                    <section>
                        <h2 class="text-base font-semibold text-zinc-900 mb-3">9. Third-Party Links & Services</h2>
                        <p>
                            The Application does not embed third-party services, advertisements, or tracking tools.
                            If the Application ever includes links to external websites, the Operator has no
                            control over their content and accepts no liability for them. Accessing any external
                            link is at your own risk.
                        </p>
                    </section>

                    <hr class="border-zinc-200" />

                    <!-- 10 -->
                    <section>
                        <h2 class="text-base font-semibold text-zinc-900 mb-3">10. Termination</h2>
                        <p>
                            You may stop using the Application at any time and delete your account via the
                            in-app account settings. Upon deletion, all your data is removed as described
                            in the 
                            <button
                                type="button"
                                @click="showPrivacyPolicy = true"
                                class="text-zinc-700 font-medium underline underline-offset-2"
                                style="-webkit-tap-highlight-color: transparent;"
                            >
                                Privacy Policy
                             </button>.
                        </p>
                        <p class="mt-2">
                            The Operator may terminate or suspend your access at any time, without notice or
                            liability, for any reason, including breach of these Terms. Upon termination, all
                            licences granted to you under these Terms cease immediately.
                        </p>
                    </section>

                    <hr class="border-zinc-200" />

                    <!-- 11 -->
                    <section>
                        <h2 class="text-base font-semibold text-zinc-900 mb-3">11. Modifications to the Terms</h2>
                        <p>
                            The Operator reserves the right to amend these Terms at any time. Material changes
                            will be communicated within the Application prior to taking effect. The date at the
                            top of this page reflects the most recent revision.
                        </p>
                        <p class="mt-2">
                            Continued use of the Application after the effective date of any change constitutes
                            acceptance of the revised Terms. If you do not agree to the updated Terms, you must
                            stop using the Application and delete your account.
                        </p>
                    </section>

                    <hr class="border-zinc-200" />

                    <!-- 12 Governing law: KEY for Abmahn protection -->
                    <section>
                        <h2 class="text-base font-semibold text-zinc-900 mb-3">12. Governing Law & Jurisdiction</h2>

                        <div class="bg-zinc-100 rounded-xl border border-zinc-200 px-5 py-4">
                            <p class="text-zinc-700">
                                These Terms are governed exclusively by <strong>Swiss law</strong>,
                                excluding its conflict-of-law rules and the United Nations Convention on
                                Contracts for the International Sale of Goods (CISG).
                            </p>
                            <p class="mt-2 text-zinc-700">
                                The exclusive place of jurisdiction for all disputes arising out of or in
                                connection with these Terms or the Application is
                                <strong>{{ jurisdiction }}, Switzerland</strong>.
                            </p>
                            <p class="mt-2 text-zinc-700">
                                Any action brought against the Operator in a jurisdiction other than
                                {{ jurisdiction }}, Switzerland, is explicitly rejected as inadmissible.
                            </p>
                        </div>
                    </section>

                    <hr class="border-zinc-200" />

                    <!-- 13 -->
                    <section>
                        <h2 class="text-base font-semibold text-zinc-900 mb-3">13. Severability</h2>
                        <p>
                            If any provision of these Terms is held to be invalid, illegal, or unenforceable
                            under applicable law, that provision shall be modified to the minimum extent
                            necessary to make it enforceable, or severed if modification is not possible.
                            All remaining provisions shall continue in full force and effect.
                        </p>
                    </section>

                    <hr class="border-zinc-200" />

                    <!-- 14 -->
                    <section>
                        <h2 class="text-base font-semibold text-zinc-900 mb-3">14. Entire Agreement</h2>
                        <p>
                            These Terms, together with the 
                            <button
                                type="button"
                                @click="showPrivacyPolicy = true"
                                class="text-zinc-700 font-medium underline underline-offset-2"
                                style="-webkit-tap-highlight-color: transparent;"
                            >
                                Privacy Policy
                            </button>
                            constitute the entire agreement between you and the Operator with respect to the
                            Application and supersede all prior agreements, understandings, or representations.
                        </p>
                    </section>

                    <hr class="border-zinc-200" />

                    <!-- 15 -->
                    <section>
                        <h2 class="text-base font-semibold text-zinc-900 mb-3">15. Contact</h2>
                        <div class="bg-white rounded-xl border border-zinc-200 px-5 py-4 text-zinc-600 space-y-1">
                            <p><strong>{{ operatorName }}</strong></p>
                            <p>{{ operatorAddress }}</p>
                            <p>Switzerland</p>
                            <p class="mt-2">
                                <a :href="'mailto:' + contactEmail"
                                   class="text-zinc-900 underline underline-offset-2">
                                    {{ contactEmail }}
                                </a>
                            </p>
                        </div>
                    </section>

                </div>

                <p class="mt-16 text-xs text-zinc-400 text-center">
                    © {{ new Date().getFullYear() }} {{ appName }} · All rights reserved
                </p>

            </div>
        </div>
    </main>
</template>

<script setup>

import { ref } from 'vue'

import PrivacyPolicy from './PrivacyPolicy.vue'

const appName         = 'PromotionCheck'
const operatorName    = 'Nils Niklas Buchli'
const operatorAddress = 'Hunzigeweid 30, 3113 Rubigen'
const contactEmail    = 'nils.buchli@mygymer.ch'
const jurisdiction    = 'Bern'    
const lastUpdated     = '8 April 2026'

defineEmits(['back'])

const showPrivacyPolicy = ref(false)

</script>