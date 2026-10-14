import { useForm, usePage } from '@inertiajs/react';
import { Check, LockKeyhole, ShieldCheck, UsersRound } from 'lucide-react';
import AppLayout from '../../Layouts/AppLayout';
import Button from '../../Components/Button';
import Pagination from '../../Components/Pagination';
import { date, initials } from '../../lib/format';

function MemberRow({ member, roles, self }) {
    const form = useForm({ role: member.role });
    const changed = form.data.role !== member.role;
    return (
        <tr>
            <td>
                <div className="member-cell">
                    <span className="avatar">{initials(member.name)}</span>
                    <span>
                        <strong>
                            {member.name}
                            {self && <small className="you-badge">You</small>}
                        </strong>
                        <small>{member.email}</small>
                    </span>
                </div>
            </td>
            <td>
                <span className="joined-date">{date(member.created_at)}</span>
            </td>
            <td>
                <form
                    className="role-form"
                    onSubmit={(event) => {
                        event.preventDefault();
                        form.put(`/team/${member.id}`, { preserveScroll: true });
                    }}
                >
                    <select
                        className="filter-select"
                        aria-label={`Role for ${member.name}`}
                        disabled={self || form.processing}
                        value={form.data.role}
                        onChange={(event) => form.setData('role', event.target.value)}
                    >
                        {roles.map((role) => (
                            <option key={role}>{role}</option>
                        ))}
                    </select>
                    {!self && (
                        <Button
                            variant={changed ? 'primary' : 'secondary'}
                            type="submit"
                            processing={form.processing}
                            disabled={!changed}
                        >
                            <Check size={14} /> Save
                        </Button>
                    )}
                    {self && (
                        <span className="self-lock" title="Your own role cannot be changed here">
                            <LockKeyhole size={15} />
                            <span className="sr-only">Your own role is protected</span>
                        </span>
                    )}
                </form>
                {form.errors.role && (
                    <p className="field-error" role="alert">
                        {form.errors.role}
                    </p>
                )}
            </td>
        </tr>
    );
}

export default function Team({ users, roles }) {
    const user = usePage().props.auth.user;
    return (
        <AppLayout
            title="Team members"
            description="The right access for the people in your workspace."
        >
            <div className="role-guide">
                <div>
                    <ShieldCheck size={22} />
                    <h3>Admin</h3>
                    <p>Full inventory access, category deletion, and team management.</p>
                </div>
                <div>
                    <UsersRound size={22} />
                    <h3>Manager</h3>
                    <p>
                        Create and maintain products and categories. No team or category deletion
                        access.
                    </p>
                </div>
                <div>
                    <LockKeyhole size={22} />
                    <h3>User</h3>
                    <p>Browse the dashboard and inventory with read-only access.</p>
                </div>
            </div>
            <section className="panel">
                <div className="panel-heading">
                    <div>
                        <h2>
                            Your people <span className="count-pill">{users.total}</span>
                        </h2>
                        <p>New members join through the registration page.</p>
                    </div>
                </div>
                <div className="table-scroll">
                    <table className="product-table team-table">
                        <thead>
                            <tr>
                                <th>Team member</th>
                                <th>Joined</th>
                                <th>Workspace role</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.data.map((member) => (
                                <MemberRow
                                    key={member.id}
                                    member={member}
                                    roles={roles}
                                    self={member.id === user.id}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>
                <Pagination data={users} />
            </section>
        </AppLayout>
    );
}
