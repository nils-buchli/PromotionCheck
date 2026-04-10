<template>
    <main class="flex flex-col h-full w-full overflow-hidden">
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
                    <h1 class="text-3xl font-semibold text-zinc-900 mb-2">Privacy Policy</h1>
                    <p class="text-sm text-zinc-400">Last updated: {{ lastUpdated }}</p>
                </div>

                <div class="space-y-10 text-zinc-700 text-sm leading-relaxed">

                    <!-- 1 -->
                    <section>
                        <h2 class="text-base font-semibold text-zinc-900 mb-3">1. Introduction & Scope</h2>
                        <p>
                            This Privacy Policy explains how <strong>{{ appName }}</strong> ("we", "us", "our") collects,
                            stores, and processes personal data in connection with the use of this application.
                        </p>
                        <p class="mt-2">
                            This application is operated in accordance with the Swiss Federal Act on Data Protection
                            (<strong>nFADP / nDSG</strong>, in force since 1 September 2023) and, to the extent applicable,
                            the EU General Data Protection Regulation (<strong>GDPR</strong>, Regulation (EU) 2016/679).
                        </p>
                        <p class="mt-2">
                            By creating an account and using the application, you acknowledge that you have read and
                            understood this policy.
                        </p>
                    </section>

                    <hr class="border-zinc-200" />

                    <!-- 2 -->
                    <section>
                        <h2 class="text-base font-semibold text-zinc-900 mb-3">2. Data Controller</h2>
                        <div class="bg-white rounded-xl border border-zinc-200 px-5 py-4 space-y-1">
                            <p><strong>{{ controllerName }}</strong></p>
                            <p class="text-zinc-500">{{ controllerAddress }}</p>
                            <p class="text-zinc-500">{{ controllerCountry }}</p>
                            <p class="mt-2">
                                Contact:
                                <a :href="'mailto:' + contactEmail" class="text-zinc-900 underline underline-offset-2">
                                    {{ contactEmail }}
                                </a>
                            </p>
                        </div>
                    </section>

                    <hr class="border-zinc-200" />

                    <!-- 3 -->
                    <section>
                        <h2 class="text-base font-semibold text-zinc-900 mb-3">3. Data We Collect</h2>
                        <p class="mb-4">We collect only the data that is strictly necessary to provide the service:</p>

                        <div class="space-y-3">
                            <div class="bg-white rounded-xl border border-zinc-200 px-5 py-4">
                                <p class="font-medium text-zinc-900 mb-1">Account data</p>
                                <ul class="list-disc list-inside space-y-1 text-zinc-600">
                                    <li>Username (chosen freely by the user)</li>
                                    <li>
                                        Password: stored exclusively as a
                                        <strong>cryptographic hash</strong> (Werkzeug / PBKDF2-SHA256).
                                        We never store or transmit your password in plain text.
                                    </li>
                                </ul>
                            </div>

                            <div class="bg-white rounded-xl border border-zinc-200 px-5 py-4">
                                <p class="font-medium text-zinc-900 mb-1">Grade & academic data</p>
                                <ul class="list-disc list-inside space-y-1 text-zinc-600">
                                    <li>School years (names)</li>
                                    <li>Subjects and sub-subjects (names, weights)</li>
                                    <li>Individual grades (marks, weights, dates)</li>
                                    <li>All other objects you explicitly enter into the application</li>
                                </ul>
                            </div>

                            <div class="bg-white rounded-xl border border-zinc-200 px-5 py-4">
                                <p class="font-medium text-zinc-900 mb-1">Technical / operational data</p>
                                <ul class="list-disc list-inside space-y-1 text-zinc-600">
                                    <li>Session tokens (JWT) used solely for authentication</li>
                                    <li>Standard server log entries (IP address, user provided timestamp, HTTP method): 
                                        kept for a maximum of 30 days for security purposes</li>
                                </ul>
                            </div>
                        </div>

                        <p class="mt-4 text-zinc-500 text-xs">
                            We do not collect names, email addresses, phone numbers, location data, payment information,
                            or any other personal data beyond the above.
                        </p>
                    </section>

                    <hr class="border-zinc-200" />

                    <!-- 4 -->
                    <section>
                        <h2 class="text-base font-semibold text-zinc-900 mb-3">4. Legal Basis for Processing</h2>
                        <p>We process your personal data on the following legal bases:</p>
                        <ul class="mt-3 space-y-2 list-disc list-inside text-zinc-600">
                            <li>
                                <strong>Performance of a contract</strong> (Art. 31 nFADP / Art. 6(1)(b) GDPR):  
                                processing your account and grade data is necessary to provide the service you requested.
                            </li>
                            <li>
                                <strong>Legitimate interests</strong> (Art. 31 nFADP / Art. 6(1)(f) GDPR): 
                                server log data is processed to maintain security and investigate abuse.
                            </li>
                        </ul>
                    </section>

                    <hr class="border-zinc-200" />

                    <!-- 5 -->
                    <section>
                        <h2 class="text-base font-semibold text-zinc-900 mb-3">5. Purpose of Processing</h2>
                        <p>Your data is used exclusively for the following purposes:</p>
                        <ul class="mt-3 space-y-1 list-disc list-inside text-zinc-600">
                            <li>Authenticating your identity and maintaining your session</li>
                            <li>Associating your academic data with your account</li>
                            <li>Displaying and calculating your grades within the application</li>
                            <li>Ensuring the security and integrity of the service</li>
                        </ul>
                        <p class="mt-3 font-medium text-zinc-900">
                            Your data is never used for advertising, profiling, analytics, or any purpose
                            other than operating the service described above.
                        </p>
                    </section>

                    <hr class="border-zinc-200" />

                    <!-- 6 -->
                    <section>
                        <h2 class="text-base font-semibold text-zinc-900 mb-3">6. Data Storage & Location</h2>
                        <p>
                            All data is stored in a <strong>PostgreSQL database</strong> on a Virtual Private Server
                            operated by <strong>Infomaniak Network SA</strong>, a Swiss hosting company headquartered in
                            Geneva, Switzerland.
                        </p>
                        <p class="mt-2">
                            Infomaniak operates data centres <strong>exclusively in Switzerland</strong> and
                            contractually guarantees that data is never transferred outside its own Swiss infrastructure.
                            Infomaniak is certified to <strong>ISO 27001</strong> (information security management) and
                            complies with both the nFADP and the GDPR in its role as a data processor.
                        </p>
                        <p class="mt-2">
                            No data is transferred to third countries (outside Switzerland or the EEA).
                        </p>
                    </section>

                    <hr class="border-zinc-200" />

                    <!-- 7 -->
                    <section>
                        <h2 class="text-base font-semibold text-zinc-900 mb-3">7. Data Retention</h2>
                        <p>
                            Your data is retained for as long as your account exists.
                        </p>
                        <p class="mt-2">
                            When you delete your account, <strong>all personal data is immediately and
                            permanently deleted from the active database</strong> (account data, all grade data,
                            all related objects).
                        </p>
                        <p class="mt-2">
                            Infomaniak performs automated infrastructure backups. Residual copies of your data
                            may therefore exist in encrypted backups for a maximum of <strong>30 days</strong>
                            following account deletion, after which they are irrecoverably purged. During this
                            period the backup data is not accessible or used in any way.
                        </p>
                        <p class="mt-2">
                            Server log entries are deleted automatically after a maximum of 30 days.
                        </p>
                    </section>

                    <hr class="border-zinc-200" />

                    <!-- 8 -->
                    <section>
                        <h2 class="text-base font-semibold text-zinc-900 mb-3">8. Disclosure to Third Parties</h2>
                        <p>
                            We <strong>do not sell, rent, or share</strong> your personal data with any third parties
                            for commercial purposes.
                        </p>
                        <p class="mt-2">
                            The only third party with access to the infrastructure on which your data is stored is
                            Infomaniak Network SA, acting solely as a <strong>data processor</strong> under a
                            contractual data processing agreement. Infomaniak has no independent right to access
                            or use your personal data.
                        </p>
                        <p class="mt-2 text-zinc-500 text-xs">
                            We may be required to disclose data if compelled by a binding Swiss legal order.
                            We will notify you of any such request to the extent permitted by law.
                        </p>
                    </section>

                    <hr class="border-zinc-200" />

                    <!-- 9 -->
                    <section>
                        <h2 class="text-base font-semibold text-zinc-900 mb-3">9. Your Rights</h2>
                        <p>
                            Under the nFADP (and the GDPR where applicable), you have the following rights
                            with regard to your personal data:
                        </p>
                        <div class="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div v-for="right in rights" :key="right.title"
                                class="bg-white rounded-xl border border-zinc-200 px-4 py-3">
                                <p class="font-medium text-zinc-900 text-xs mb-1">{{ right.title }}</p>
                                <p class="text-zinc-500 text-xs">{{ right.description }}</p>
                            </div>
                        </div>
                        <p class="mt-4">
                            To exercise any of these rights, please contact us at
                            <a :href="'mailto:' + contactEmail" class="text-zinc-900 underline underline-offset-2">
                                {{ contactEmail }}
                            </a>.
                            We will respond within 30 days.
                        </p>
                    </section>

                    <hr class="border-zinc-200" />

                    <!-- 10 -->
                    <section>
                        <h2 class="text-base font-semibold text-zinc-900 mb-3">10. Security Measures</h2>
                        <p>We implement the following technical and organisational measures to protect your data:</p>
                        <ul class="mt-3 space-y-1 list-disc list-inside text-zinc-600">
                            <li>All data in transit is encrypted using <strong>TLS 1.2 or higher</strong> (HTTPS)</li>
                            <li>Passwords are never stored in plain text: only PBKDF2-SHA256 hashes</li>
                            <li>Authentication uses short-lived <strong>JWT tokens</strong></li>
                            <li>The database is not publicly accessible; connections are restricted to the application server</li>
                            <li>The hosting infrastructure (Infomaniak) undergoes annual penetration tests and holds ISO 27001 certification</li>
                        </ul>
                    </section>

                    <hr class="border-zinc-200" />

                    <!-- 11 -->
                    <section>
                        <h2 class="text-base font-semibold text-zinc-900 mb-3">11. Cookies & Tracking</h2>
                        <p>
                            This application does <strong>not</strong> use cookies, web analytics, tracking pixels,
                            or any third-party tracking technology. No data is collected for advertising or
                            behavioural profiling purposes.
                        </p>
                    </section>

                    <hr class="border-zinc-200" />

                    <!-- 12 -->
                    <section>
                        <h2 class="text-base font-semibold text-zinc-900 mb-3">12. Minors</h2>
                        <p>
                            This application is intended for students of all ages, including minors. We do not
                            knowingly collect more data than is described in this policy. If you are a parent or
                            guardian and believe that your child's data has been processed without appropriate
                            consent, please contact us using the details in Section 2.
                        </p>
                    </section>

                    <hr class="border-zinc-200" />

                    <!-- 13 -->
                    <section>
                        <h2 class="text-base font-semibold text-zinc-900 mb-3">13. Changes to This Policy</h2>
                        <p>
                            We may update this policy from time to time. If we make material changes, we will
                            notify you within the application before the changes take effect. The date at the top
                            of this page indicates when the policy was last revised. Continued use of the
                            application after the effective date constitutes acceptance of the updated policy.
                        </p>
                    </section>

                    <hr class="border-zinc-200" />

                    <!-- 14 -->
                    <section>
                        <h2 class="text-base font-semibold text-zinc-900 mb-3">14. Complaints & Supervisory Authority</h2>
                        <p>
                            If you believe your data protection rights have been violated, you have the right to
                            lodge a complaint with the Swiss Federal Data Protection and Information Commissioner
                            (<strong>FDPIC</strong>):
                        </p>
                        <div class="mt-3 bg-white rounded-xl border border-zinc-200 px-5 py-4 text-zinc-600 space-y-1">
                            <p>Federal Data Protection and Information Commissioner (FDPIC)</p>
                            <p>Feldeggweg 1, 3003 Bern, Switzerland</p>
                            <p>
                                <a href="https://www.edoeb.admin.ch" target="_blank" rel="noopener noreferrer"
                                    class="text-zinc-900 underline underline-offset-2">
                                    www.edoeb.admin.ch
                                </a>
                            </p>
                        </div>
                        <p class="mt-3 text-zinc-500 text-xs">
                            If you are an EU resident, you may also contact the supervisory authority of your
                            EU member state.
                        </p>
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

defineEmits(['back'])

const appName           = 'Pluspoints'         
const controllerName    = 'Nils Niklas Buchli'       
const controllerAddress = 'Hunzigeweid 30, 3113 Rubigen'  
const controllerCountry = 'Switzerland'
const contactEmail      = 'nils.buchli@mygymer.ch' 
const lastUpdated       = '8 April 2026'


const rights = [
    {
        title: 'Right of access (Art. 25 nFADP)',
        description: 'Obtain a copy of all personal data we hold about you.',
    },
    {
        title: 'Right to rectification (Art. 32 nFADP)',
        description: 'Request correction of inaccurate or incomplete data.',
    },
    {
        title: 'Right to erasure (Art. 32 nFADP)',
        description: 'Request deletion of your data: or use the in-app "Delete Account" function.',
    },
    {
        title: 'Right to data portability (Art. 28 nFADP)',
        description: 'Receive your data in a structured, machine-readable format.',
    },
    {
        title: 'Right to object (Art. 30 nFADP)',
        description: 'Object to processing based on our legitimate interests.',
    },
    {
        title: 'Right to withdraw consent',
        description: 'Where processing is based on consent, withdraw it at any time without affecting past processing.',
    },
]
</script>   