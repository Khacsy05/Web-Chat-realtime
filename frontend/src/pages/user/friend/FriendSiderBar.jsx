import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FRIEND_MENU } from '@/config/menuFriend.config'
import { Search, UserPlus, UsersRound } from 'lucide-react'
import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import useAuthStore from "@/stores/useAuthStore";

const FriendSiderBar = ({ onOpenContent }) => {
    const [isSearch, setIsSearch] = useState(false);
    const role = useAuthStore((state) => state.role);
    const [searchValue, setSearchValue] = useState("");
    const filteredMenu = FRIEND_MENU.filter((item) =>
        item.roles.includes(role)
    );
    return (
        <div className="flex h-full min-h-0 flex-col overflow-hidden">
            {/* Header */}
            <div className="shrink-0 px-3 pt-3 ">
                <div className='flex gap-1'>
                    <div className='relative'>
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input className=" h-9 w-[220px] text-sm pl-7  bg-[#ededed]"
                            placeholder="Search..."
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            onFocus={() => setIsSearch(true)}
                        />
                    </div>
                    {isSearch ? (
                        <Button className="cursor-pointer w-[70px] bg-white text-black hover:bg-[#ededed] "
                            onClick={() => {
                                setIsSearch(false);
                                setSearchValue(""); // 🔥 reset input
                            }}
                        >
                            Đóng
                        </Button>
                    ) : (
                        <div className="flex ">
                            <Button className="bg-white text-black hover:bg-[#ededed] ">
                                <UserPlus size={20} />
                            </Button>
                            <Button className="bg-white text-black hover:bg-[#ededed] cursor-pointer ">
                                <UsersRound size={20} />
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* RIGHT */}

            <nav className="flex flex-col h-full bg-white py-4 overflow-y-auto custom-scrollbar ">
                <div className="px-2 space-y-1">
                    {filteredMenu.map((item, index) => {
                        // Render nhãn tiêu đề (Label)
                        if (item.label) {
                            return (
                                <p
                                    key={`label-${index}`}
                                    className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-6 mb-2 px-2"
                                >
                                    {item.label}
                                </p>
                            );
                        }

                        // Render các mục chuyển trang (Link)

                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                onClick={() => onOpenContent?.()}
                                className={({ isActive }) =>
                                    `flex items-center rounded-sm p-3 transition ${isActive
                                        ? "bg-[#E8EDFF] text-black "
                                        : "bg-white"
                                    }`
                                }
                            >
                                <span className="flex items-center gap-3">
                                    {item.icon && <item.icon size={20} />}
                                    <span>{item.title}</span>
                                </span>
                            </NavLink>
                        );
                    })}
                </div>
            </nav>
        </div>
    )
}

export default FriendSiderBar
