namespace SmartFix.Api.Services
{
    public static class DepartmentClassifier
    {
        public static string Classify(string text)
        {
            var t = (text ?? "").ToLowerInvariant();

            bool Has(params string[] keys) => keys.Any(k => t.Contains(k));

            if (Has("light", "fan", "switch", "socket", "power", "bulb", "fuse"))
                return "Electrician";

            if (Has("leak", "tap", "pipe", "toilet", "flush", "drain", "bathroom"))
                return "Plumber";

            if (Has("door", "lock", "hinge", "cupboard", "window", "handle"))
                return "Carpenter";

            if (Has("no water", "low pressure", "tank", "motor", "borewell"))
                return "Water";

            return "General";
        }
    }
}