import ClinicScheduleSettings from "./ClinicScheduleSettings"

const SettingsTab = () => {
    return (
        <section className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">Schedule</h1>
            </div>

            <ClinicScheduleSettings />
        </section>
    )
}

export default SettingsTab