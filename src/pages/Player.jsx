import { useEffect, useState } from "react";
import supabase from "../lib/supabase";

function getVideoId(url) {

    try {

        const u = new URL(url);

        if (u.hostname.includes("youtu.be")) {

            return u.pathname.substring(1);

        }

        return u.searchParams.get("v");

    }

    catch {

        return null;

    }

}

export default function Player() {

    const [video, setVideo] = useState(null);

    async function loadVideo() {

        const { data, error } = await supabase

            .from("videos")

            .select("*")

            .eq("approved", true)

            .eq("played", false)

            .order("created_at", {
                ascending: true
            })

            .limit(1)

            .maybeSingle();

        if (error) {

            console.error(error);

            return;

        }

        setVideo(data);

    }

    useEffect(() => {

        loadVideo();

        const channel = supabase

            .channel("player")

            .on(

                "postgres_changes",

                {

                    event: "*",

                    schema: "public",

                    table: "videos"

                },

                () => {

                    loadVideo();

                }

            )

            .subscribe();

        return () => {

            supabase.removeChannel(channel);

        };

    }, []);

    if (!video) {

        return (

            <div

                style={{

                    position: "fixed",

                    inset: 0,

                    background: "#000",

                    display: "flex",

                    justifyContent: "center",

                    alignItems: "center",

                    color: "#ffffff",

                    fontSize: "48px",

                    fontFamily: "Verdana, sans-serif",

                    overflow: "hidden"

                }}

            >

                Waiting for video...

            </div>

        );

    }

    const videoId = getVideoId(video.url);

    if (!videoId) {

        return (

            <div

                style={{

                    position: "fixed",

                    inset: 0,

                    background: "#000",

                    display: "flex",

                    justifyContent: "center",

                    alignItems: "center",

                    color: "#ffffff",

                    fontSize: "40px",

                    fontFamily: "Verdana, sans-serif"

                }}

            >

                Invalid YouTube URL

            </div>

        );

    }

    return (

        <div

            style={{

                position: "fixed",

                inset: 0,

                background: "#000",

                overflow: "hidden"

            }}

        >

            <iframe

                title="OBS Player"

                src={`https://www.youtube.com/embed/${videoId}?autoplay=1&controls=0&rel=0&modestbranding=1`}

                allow="autoplay; fullscreen"

                allowFullScreen

                style={{

                    position: "absolute",

                    inset: 0,

                    width: "100%",

                    height: "100%",

                    border: "none"

                }}

            />

        </div>

    );

}